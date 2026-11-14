import { Body, Controller, Delete, Get, Param, Post, Query, Request } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { toPositiveInt } from 'src/common/pagination';
import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakService } from '../../ispeak/service/ispeak.service';
import { IspeakTagService } from '../../ispeak/service/ispeakTag.service';
import { DraftPayload, IspeakDraftService } from '../service/ispeakDraft.service';

/** 单用户草稿上限，避免自动保存把库塞满 */
const DRAFT_LIMIT = 200;

@Controller('/ispeak/draft')
export class IspeakDraftController {
  constructor(
    private readonly draftService: IspeakDraftService,
    private readonly ispeakService: IspeakService,
    private readonly tagService: IspeakTagService,
  ) {}

  /**
   * 自动保存：带 draftId 走更新，否则新建
   * 正文允许为空（刚打开编辑器就触发保存）
   */
  @Post('/save')
  async save(@Request() req, @Body() body) {
    const userId = req.user.userId;
    const { draftId, title, content, type, tag, showComment, theme, mdc } = body || {};

    if (tag && !isValidObjectId(tag)) return new ErrorModal(null, '标签 id 不合法');
    if (type && !['0', '1', '2'].includes(String(type))) {
      return new ErrorModal(null, '可见性取值不合法');
    }

    if (!draftId) {
      const count = await this.draftService.countByUser(userId);
      if (count >= DRAFT_LIMIT) return new ErrorModal(null, '草稿数量已达上限，请先清理');
    }

    const payload: DraftPayload = {
      title: String(title || '').slice(0, 120),
      content: String(content || ''),
      type: type ? String(type) : '0',
      showComment: showComment === '0' ? '0' : '1',
      theme: theme ? String(theme) : 'default',
      mdc: mdc && typeof mdc === 'object' ? mdc : null,
    };
    if (tag) payload.tag = tag;

    const doc = await this.draftService.save(userId, draftId, payload);
    if (!doc) return new ErrorModal(null, '草稿不存在');

    return new SuccessModal({
      draftId: String(doc._id),
      savedAt: (doc as any).updatedAt || new Date().toISOString(),
    });
  }

  @Get('/list')
  async list(@Request() req, @Query() query) {
    const page = toPositiveInt(query.page, 1, 10000);
    const pageSize = toPositiveInt(query.pageSize, 20);
    const result = await this.draftService.list(req.user.userId, page, pageSize);
    return new SuccessModal(result);
  }

  @Get('/get/:id')
  async detail(@Request() req, @Param() param) {
    const doc = await this.draftService.findOne(req.user.userId, param.id);
    if (!doc) return new ErrorModal(null, '草稿不存在');
    return new SuccessModal(doc);
  }

  @Delete('/:id')
  async remove(@Request() req, @Param() param) {
    if (!isValidObjectId(param.id)) return new ErrorModal(null, 'id不合法');
    const doc = await this.draftService.remove(req.user.userId, param.id);
    if (!doc) return new ErrorModal(null, '草稿不存在');
    return new SuccessModal({ deleted: 1 }, '已删除');
  }

  /**
   * 草稿转正式说说：成功后删除草稿
   * 注意 tag 可能已被删除，这里要重新校验，否则会写出一条挂空标签的数据
   */
  @Post('/publish')
  async publish(@Request() req, @Body() body) {
    const userId = req.user.userId;
    const draftId = body?.draftId;
    if (!isValidObjectId(draftId)) return new ErrorModal(null, 'id不合法');

    const draft = await this.draftService.findOne(userId, draftId);
    if (!draft) return new ErrorModal(null, '草稿不存在');

    if (!draft.content || !String(draft.content).trim()) {
      return new ErrorModal(null, '正文不能为空');
    }
    if (!draft.tag || !isValidObjectId(draft.tag)) {
      return new ErrorModal(null, '请选择一个标签');
    }

    const tagDoc = await this.tagService.findOneTag({ _id: draft.tag, user: userId });
    if (!tagDoc) return new ErrorModal(null, '标签已不存在，请重新选择');

    const speak = await this.ispeakService.addOneSpeak({
      title: draft.title || '',
      content: draft.content,
      type: draft.type || '0',
      tag: draft.tag,
      showComment: draft.showComment === '0' ? '0' : '1',
      theme: draft.theme || 'default',
      mdc: draft.mdc || null,
      author: userId,
    });

    await this.draftService.remove(userId, draftId);

    return new SuccessModal({ _id: String((speak as any)._id) }, '已发布');
  }
}
