import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { toPositiveInt } from 'src/common/pagination';
import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakExtService } from '../service/ispeakExt.service';
import { IspeakFavoriteService } from '../service/ispeakFavorite.service';

@Controller('/ispeak/favorite')
export class IspeakFavoriteController {
  constructor(
    private readonly favoriteService: IspeakFavoriteService,
    private readonly extService: IspeakExtService,
  ) {}

  /**
   * 收藏 / 取消收藏（同一接口切换）
   */
  @Post('/toggle')
  async toggle(@Request() req, @Body() body) {
    const { speakId } = body || {};
    if (!isValidObjectId(speakId)) return new ErrorModal(null, 'id不合法');

    const raw = await this.extService.findRaw(speakId);
    const invisible = this.extService.checkVisible(raw, req.user.userId);
    if (invisible) return new ErrorModal(null, invisible);

    const result = await this.favoriteService.toggle(speakId, req.user.userId);
    return new SuccessModal(result);
  }

  /**
   * 我的收藏
   */
  @Get('/list')
  async list(@Query() query, @Request() req) {
    const page = toPositiveInt(query.page, 1, 10000);
    const pageSize = toPositiveInt(query.pageSize, 10);
    const result = await this.favoriteService.listByUser(req.user.userId, page, pageSize);
    return new SuccessModal(result);
  }

  /**
   * 某条说说的收藏者列表（仅作者可查）
   */
  @Get('/users')
  async users(@Query() query, @Request() req) {
    const { speakId } = query;
    if (!isValidObjectId(speakId)) return new ErrorModal(null, 'id不合法');

    const raw = await this.extService.findRaw(speakId);
    if (!raw) return new ErrorModal(null, '内容不存在');
    if (String(raw.author) !== String(req.user.userId)) return new ErrorModal(null, '无权查看');

    const page = toPositiveInt(query.page, 1, 10000);
    const pageSize = toPositiveInt(query.pageSize, 20);
    const result = await this.favoriteService.listBySpeak(speakId, page, pageSize);
    return new SuccessModal(result);
  }
}
