/*
 * 说说扩展模块端到端冒烟测试
 *
 * 覆盖：create / detail / like / favorite 全部 8 个新端点，以及
 *       归档过滤对 3 个既有端点的实际效果、既有响应结构未变。
 *
 * 运行前置（仅本地，不进 package.json，避免影响部署依赖）：
 *   npm i -D mongodb-memory-server supertest
 *   npx nest build
 *   node test/smoke/ispeak-ext.smoke.js
 *
 * 首次运行会下载 MongoDB 内存版二进制（约 100MB）。
 */
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.DATABASE_URL = mongod.getUri('kkapi');
  process.env.SECRETKEY = 'smoke-test-secret';

  const { NestFactory } = require('@nestjs/core');
  const { ValidationPipe } = require('../../dist/pipe/validate.pipe');
  const { HttpExceptionFilter } = require('../../dist/filters/http-exception.filter');
  const { TransformInterceptor } = require('../../dist/interceptor/transform.interceptor');
  const { AppModule } = require('../../dist/app.module');
  const jwt = require('jsonwebtoken');
  const request = require('supertest');
  const mongoose = require('mongoose');

  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('/api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  const api = request(app.getHttpServer());
  const conn = app.get(require('@nestjs/mongoose').getConnectionToken());

  const results = [];
  const check = (name, ok, extra) => {
    results.push({ name, ok });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  -> ' + extra : ''}`);
  };

  const u1 = new mongoose.Types.ObjectId();
  const u2 = new mongoose.Types.ObjectId();
  await conn.collection('kkapi_user_list').insertMany([
    { _id: u1, userName: 'alice', nickName: 'Alice', avatar: 'a.png', link: '/a', createdAt: new Date(), updatedAt: new Date() },
    { _id: u2, userName: 'bob', nickName: 'Bob', avatar: 'b.png', link: '/b', createdAt: new Date(), updatedAt: new Date() },
  ]);
  const tag1 = new mongoose.Types.ObjectId();
  await conn.collection('kkapi_ispeak_tag_list').insertOne({
    _id: tag1, name: '日常', bgColor: '#DB2828', user: u1, orderNo: 0, description: '', createdAt: new Date(), updatedAt: new Date(),
  });

  const t1 = jwt.sign({ userId: String(u1), userName: 'alice' }, process.env.SECRETKEY);
  const t2 = jwt.sign({ userId: String(u2), userName: 'bob' }, process.env.SECRETKEY);
  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const auth = (t) => ({ Authorization: `Bearer ${t}` });

  let r = await api.post('/api/ispeak/create').set(auth(t1)).send({ tag: String(tag1) });
  check('create 缺 content 被 DTO 拦截', r.body.code === -1 && r.status === 200 && r.body.message === '请认真检查参数',
    `status=${r.status}, code=${r.body.code}, msg=${r.body.message}`);

  r = await api.post('/api/ispeak/create').set(auth(t2)).send({ content: 'x', tag: String(tag1) });
  check('create 标签归属校验', r.body.code === -1 && r.body.message === '标签不存在', r.body.message);

  r = await api.post('/api/ispeak/create').set(auth(t1)).set('User-Agent', UA).send({
    content: '第一篇 # 标题\n正文', tag: String(tag1), visibility: 'public',
    theme: 'dark', mdc: { version: 1, components: { Callout: { type: 'tip' } } },
    location: { type: 'Point', coordinates: [120.15, 30.28], name: '杭州' },
  });
  const speakId = r.body.data && r.body.data._id;
  check('create 公开说说', r.body.code === 0 && !!speakId, `type=${r.body.data && r.body.data.type}`);
  check('create 设备信息已落库', !!(r.body.data.client && r.body.data.client.browser === 'Chrome'),
    JSON.stringify(r.body.data.client));
  check('create theme 已落库', r.body.data.theme === 'dark', r.body.data.theme);
  check('create mdc 已落库', !!(r.body.data.mdc && r.body.data.mdc.version === 1), JSON.stringify(r.body.data.mdc));
  check('create location 已落库', !!(r.body.data.location && r.body.data.location.coordinates[0] === 120.15),
    JSON.stringify(r.body.data.location));

  r = await api.get(`/api/ispeak/detail/${speakId}`);
  check('detail 匿名可见且阅读数 +1', r.body.code === 0 && r.body.data.counts.read === 1, `read=${r.body.data && r.body.data.counts.read}`);
  check('detail 匿名不泄露 ua', r.body.data.client && r.body.data.client.ua === undefined, JSON.stringify(r.body.data.client));
  check('detail 未登录 liked=false', r.body.data.liked === false);

  r = await api.get(`/api/ispeak/detail/${speakId}`).set(auth(t1));
  check('detail 作者可见 ua', !!(r.body.data.client && r.body.data.client.ua), 'ua ok');
  check('detail 作者访问不计阅读数', r.body.data.counts.read === 1, `read=${r.body.data.counts.read}`);

  r = await api.post('/api/ispeak/like/toggle').set(auth(t2)).send({ speakId });
  check('like toggle on', r.body.data.liked === true && r.body.data.likeCount === 1, JSON.stringify(r.body.data));
  r = await api.post('/api/ispeak/like/toggle').set(auth(t2)).send({ speakId });
  check('like toggle off', r.body.data.liked === false && r.body.data.likeCount === 0, JSON.stringify(r.body.data));
  r = await api.post('/api/ispeak/like/toggle').set(auth(t2)).send({ speakId });
  check('like toggle on again', r.body.data.liked === true && r.body.data.likeCount === 1, JSON.stringify(r.body.data));

  r = await api.get(`/api/ispeak/like/list?speakId=${speakId}`).set(auth(t2));
  check('like/list 返回点赞者', r.body.data.total === 1 && r.body.data.items[0].nickName === 'Bob',
    `total=${r.body.data.total}, nick=${r.body.data.items[0] && r.body.data.items[0].nickName}`);
  r = await api.get('/api/ispeak/like/mine').set(auth(t2));
  check('like/mine 返回说说', r.body.data.total === 1 && r.body.data.items[0].speakId === speakId, `total=${r.body.data.total}`);

  r = await api.post('/api/ispeak/favorite/toggle').set(auth(t2)).send({ speakId });
  check('favorite toggle on', r.body.data.favorited === true && r.body.data.favoriteCount === 1, JSON.stringify(r.body.data));
  r = await api.get('/api/ispeak/favorite/list').set(auth(t2));
  check('favorite/list', r.body.data.total === 1 && !!r.body.data.items[0].favoritedAt, `total=${r.body.data.total}`);
  r = await api.get(`/api/ispeak/favorite/users?speakId=${speakId}`).set(auth(t1));
  check('favorite/users 作者可查', r.body.data.total === 1, `total=${r.body.data.total}`);
  r = await api.get(`/api/ispeak/favorite/users?speakId=${speakId}`).set(auth(t2));
  check('favorite/users 非作者被拒', r.body.code === -1 && r.body.message === '无权查看', r.body.message);

  r = await api.post('/api/ispeak/create').set(auth(t1)).set('User-Agent', UA)
    .send({ content: '私密内容', tag: String(tag1), visibility: 'private' });
  const privateId = r.body.data && r.body.data._id;
  check('create 私密说说 type=2', r.body.data.type === '2', `type=${r.body.data.type}`);
  r = await api.get(`/api/ispeak/detail/${privateId}`).set(auth(t2));
  check('detail 他人访问私密被拒', r.body.code === -1 && r.body.message === '该内容仅作者可见', r.body.message);
  r = await api.get(`/api/ispeak/detail/${privateId}`);
  check('detail 匿名访问私密被拒', r.body.code === -1, r.body.message);
  r = await api.get(`/api/ispeak/detail/${privateId}`).set(auth(t1));
  check('detail 作者可读私密', r.body.code === 0, 'ok');

  r = await api.get(`/api/ispeak/get/${privateId}`);
  check('旧接口 get/:id 行为未变（仍返回私密内容）',
    r.body.code === 0 && r.body.data && String(r.body.data._id) === privateId, `data=${typeof r.body.data}`);

  r = await api.get('/api/ispeak/getByPage?page=1&pageSize=10').set(auth(t1));
  const first = r.body.data.items[0];
  check('旧接口 getByPage 结构未变（author/tag 仍为数组）', Array.isArray(first.author) && Array.isArray(first.tag),
    `keys=${Object.keys(first).sort().join(',')}`);
  check('旧接口未泄露新字段', !('client' in first) && !('theme' in first) && !('location' in first) && !('mdc' in first),
    `keys=${Object.keys(first).sort().join(',')}`);

  const favAsAuthor = await api.post('/api/ispeak/favorite/toggle').set(auth(t1)).send({ speakId: privateId });
  check('作者收藏私密说说', favAsAuthor.body.data.favorited === true, JSON.stringify(favAsAuthor.body.data));

  await conn.collection('kkapi_ispeak_list').updateOne(
    { _id: new mongoose.Types.ObjectId(privateId) }, { $set: { archivedAt: new Date() } },
  );
  r = await api.get(`/api/ispeak?author=${u1}`).set(auth(t1));
  check('旧接口 GET /ispeak 隐藏归档内容', !(r.body.data.items || []).some((it) => String(it._id) === privateId),
    `total=${r.body.data.total}`);
  r = await api.get('/api/ispeak/getByPage?page=1&pageSize=10').set(auth(t1));
  check('旧接口 getByPage 隐藏归档内容', !(r.body.data.items || []).some((it) => String(it._id) === privateId),
    `total=${r.body.data.total}`);
  r = await api.get(`/api/ispeak/get/${privateId}`);
  check('旧接口 get/:id 隐藏归档内容', Array.isArray(r.body.data) && r.body.data.length === 0, JSON.stringify(r.body.data));
  r = await api.get(`/api/ispeak/detail/${privateId}`).set(auth(t1));
  check('detail 作者仍可见归档内容', r.body.code === 0 && !!r.body.data.archivedAt, 'ok');
  r = await api.get(`/api/ispeak/detail/${privateId}`).set(auth(t2));
  check('detail 他人对归档按不存在处理', r.body.message === '内容不存在', r.body.message);
  r = await api.get('/api/ispeak/favorite/list').set(auth(t1));
  check('favorite/list 隐藏归档内容', r.body.data.total === 0, `total=${r.body.data.total}`);

  await conn.collection('kkapi_ispeak_list').updateOne(
    { _id: new mongoose.Types.ObjectId(privateId) }, { $set: { archivedAt: null } },
  );
  r = await api.get(`/api/ispeak?author=${u1}`).set(auth(t1));
  check('取消归档后旧接口恢复可见', (r.body.data.items || []).some((it) => String(it._id) === privateId), 'restored');

  r = await api.get('/api/ispeak/like/mine?page=abc&pageSize=abc').set(auth(t2));
  check('新接口 page=abc 不报错', r.body.code === 0 && r.body.data.total === 1, `total=${r.body.data.total}`);

  const failed = results.filter((x) => !x.ok);
  console.log(`\nSUMMARY ${results.length - failed.length}/${results.length} passed`);
  await app.close();
  await mongod.stop();
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error('ERROR:', e); process.exit(2); });
