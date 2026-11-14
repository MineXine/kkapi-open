import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { isValidObjectId } from 'mongoose';
import * as mongoose from 'mongoose';
import { Connection, Model } from 'mongoose';
import { toPublicClientInfo } from 'src/common/ua';
import { ISpeakModelName, UserModelName } from 'src/constant/model-name';
import { IspeakDocument } from '../../ispeak/schema/ispeak.schema';
import { IspeakFavoriteService } from './ispeakFavorite.service';
import { IspeakLikeService } from './ispeakLike.service';
import { IspeakMetaService } from './ispeakMeta.service';

export interface DetailResult {
  error?: string;
  data?: any;
  isAuthor?: boolean;
}

@Injectable()
export class IspeakExtService {
  constructor(
    // 复用 IspeakModule 已注册的 model，而不是在本模块重复 forFeature：
    // 同名 model 二次注册不会抛错，但会编译出另一个 Model 实例并覆盖 connection.models，
    // 导致同一集合出现两条 model 定义（索引也可能被重复构建）。
    @InjectConnection() private readonly connection: Connection,
    private readonly metaService: IspeakMetaService,
    private readonly likeService: IspeakLikeService,
    private readonly favoriteService: IspeakFavoriteService,
  ) {}

  private get ispeakModel(): Model<IspeakDocument> {
    return this.connection.model(ISpeakModelName.ISpeakList) as Model<IspeakDocument>;
  }

  /**
   * 新建说说（v2 写入）
   * 只做落库，不做业务校验；校验在 controller 层完成，便于把错误以 ErrorModal 返回
   */
  async createOne(payload: Record<string, any>) {
    return this.ispeakModel.create(payload);
  }

  /**
   * 读取原始文档（不带任何可见性过滤），用于权限判定
   */
  async findRaw(speakId: string) {
    if (!isValidObjectId(speakId)) return null;
    return this.ispeakModel.findOne({ _id: speakId }).lean().exec();
  }

  /**
   * 可见性判定，返回 null 表示可见，否则返回给前端的中文提示
   *
   * 规则与既有列表接口保持一致（type: 0 公开 / 1 仅登录 / 2 仅作者），
   * 额外叠加归档：归档内容仅作者本人可见，对其他人按「不存在」处理，避免泄露存在性。
   */
  checkVisible(raw: any, viewerId?: string): string | null {
    if (!raw) return '内容不存在';
    const isAuthor = !!viewerId && String(raw.author) === String(viewerId);
    if (raw.archivedAt && !isAuthor) return '内容不存在';
    if (raw.type === '2' && !isAuthor) return '该内容仅作者可见';
    if (raw.type === '1' && !viewerId) return '该内容需登录后查看';
    return null;
  }

  /**
   * 详情聚合：内容 + 作者 + 标签 + 计数 + 当前用户互动状态 + 设备信息
   */
  async getDetail(speakId: string, viewerId?: string): Promise<DetailResult> {
    if (!isValidObjectId(speakId)) return { error: 'id不合法' };

    const rows = await this.ispeakModel
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(speakId) } },
        {
          $lookup: {
            from: ISpeakModelName.ISpeakTagList,
            localField: 'tag',
            foreignField: '_id',
            as: 'tag',
          },
        },
        {
          $lookup: {
            from: UserModelName.User,
            localField: 'author',
            foreignField: '_id',
            as: 'author',
          },
        },
        {
          $project: {
            title: 1,
            content: 1,
            type: 1,
            showComment: 1,
            createdAt: 1,
            updatedAt: 1,
            tag: 1,
            author: 1,
            // 存量文档没有这些字段，聚合不会套用 Mongoose 默认值，必须显式归一
            archivedAt: { $ifNull: ['$archivedAt', null] },
            theme: { $ifNull: ['$theme', 'default'] },
            mdc: { $ifNull: ['$mdc', null] },
            client: { $ifNull: ['$client', null] },
            location: { $ifNull: ['$location', null] },
            mediaIds: { $ifNull: ['$mediaIds', []] },
          },
        },
      ])
      .exec();

    const doc = rows && rows[0];
    if (!doc) return { error: '内容不存在' };

    const author = Array.isArray(doc.author) ? doc.author[0] : doc.author;
    const tag = Array.isArray(doc.tag) ? doc.tag[0] : doc.tag;
    const isAuthor = !!viewerId && !!author && String(author._id) === String(viewerId);

    const invisible = this.checkVisible({ ...doc, author: author ? author._id : null }, viewerId);
    if (invisible) return { error: invisible };

    // 阅读数：作者本人访问不计入；统计失败不影响详情返回
    let meta = await this.metaService.get(speakId);
    if (!isAuthor) {
      try {
        meta = (await this.metaService.inc(speakId, 'readCount', 1)) as any;
      } catch (error) {
        // 忽略计数写入失败，保证详情可用
      }
    }

    const [liked, favorited] = await Promise.all([
      this.likeService.isLiked(speakId, viewerId),
      this.favoriteService.isFavorited(speakId, viewerId),
    ]);

    const data = {
      _id: doc._id,
      title: doc.title || '',
      content: doc.content,
      theme: doc.theme,
      type: doc.type,
      showComment: doc.showComment,
      author: author
        ? {
            _id: author._id,
            userName: author.userName,
            nickName: author.nickName,
            avatar: author.avatar,
            link: author.link,
          }
        : null,
      tag: tag
        ? {
            _id: tag._id,
            name: tag.name,
            bgColor: tag.bgColor,
            description: tag.description,
          }
        : null,
      // 媒体模块（对象存储）尚未接入，先保持字段恒定，避免前端按需判空
      media: [],
      mediaIds: doc.mediaIds || [],
      mdc: doc.mdc || null,
      location: doc.location || null,
      client: isAuthor ? doc.client || null : toPublicClientInfo(doc.client),
      counts: {
        like: this.metaService.pickCount(meta as any, 'likeCount'),
        favorite: this.metaService.pickCount(meta as any, 'favoriteCount'),
        share: this.metaService.pickCount(meta as any, 'shareCount'),
        read: this.metaService.pickCount(meta as any, 'readCount'),
      },
      liked,
      favorited,
      archivedAt: doc.archivedAt || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return { data, isAuthor };
  }

  /**
   * 归档 / 取消归档
   * 只改 archivedAt，不动 type 也不删数据，因此可无损恢复
   * @returns null 表示成功，否则为给前端的提示
   */
  async setArchived(speakId: string, userId: string, archived: boolean): Promise<string | null> {
    if (!isValidObjectId(speakId)) return 'id不合法';
    const result = await this.ispeakModel
      .updateOne(
        { _id: speakId, author: userId },
        { $set: { archivedAt: archived ? new Date() : null } },
      )
      .exec();
    if (result.matchedCount === 0) return '没有找到对应speak';
    return null;
  }

  /**
   * 归档列表：只返回当前用户已归档的内容
   */
  async listArchived(userId: string, page = 1, limit = 10) {
    const filter = {
      author: new mongoose.Types.ObjectId(userId),
      archivedAt: { $ne: null },
    };

    const [total, items] = await Promise.all([
      this.ispeakModel.countDocuments(filter).exec(),
      this.ispeakModel
        .aggregate([
          { $match: filter },
          { $sort: { archivedAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: ISpeakModelName.ISpeakTagList,
              localField: 'tag',
              foreignField: '_id',
              as: 'tag',
            },
          },
          {
            $lookup: {
              from: UserModelName.User,
              localField: 'author',
              foreignField: '_id',
              as: 'author',
            },
          },
          {
            $project: {
              title: 1,
              content: 1,
              type: 1,
              showComment: 1,
              createdAt: 1,
              updatedAt: 1,
              archivedAt: 1,
              tag: 1,
              author: 1,
            },
          },
        ])
        .exec(),
    ]);

    return { total, items };
  }

  /**
   * 统计某个标签下还有多少条说说（删除标签前的前置检查）
   */
  async countByTag(tagId: string) {
    if (!isValidObjectId(tagId)) return 0;
    return this.ispeakModel.countDocuments({ tag: tagId }).exec();
  }
}
