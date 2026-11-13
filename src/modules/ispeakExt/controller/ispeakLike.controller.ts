import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { IsLogin } from 'src/common/decorator/customize';
import { toPositiveInt } from 'src/common/pagination';
import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakExtService } from '../service/ispeakExt.service';
import { IspeakLikeService } from '../service/ispeakLike.service';

@Controller('/ispeak/like')
export class IspeakLikeController {
  constructor(
    private readonly likeService: IspeakLikeService,
    private readonly extService: IspeakExtService,
  ) {}

  /**
   * 点赞 / 取消点赞（同一接口切换）
   */
  @Post('/toggle')
  async toggle(@Request() req, @Body() body) {
    const { speakId } = body || {};
    if (!isValidObjectId(speakId)) return new ErrorModal(null, 'id不合法');

    const raw = await this.extService.findRaw(speakId);
    const invisible = this.extService.checkVisible(raw, req.user.userId);
    if (invisible) return new ErrorModal(null, invisible);

    const result = await this.likeService.toggle(speakId, req.user.userId);
    return new SuccessModal(result);
  }

  /**
   * 某条说说的点赞者列表（可选登录，登录后前端可高亮自己）
   */
  @IsLogin()
  @Get('/list')
  async list(@Query() query, @Request() req) {
    const { speakId } = query;
    if (!isValidObjectId(speakId)) return new ErrorModal(null, 'id不合法');

    const raw = await this.extService.findRaw(speakId);
    const invisible = this.extService.checkVisible(raw, req?.user?.userId);
    if (invisible) return new ErrorModal(null, invisible);

    const page = toPositiveInt(query.page, 1, 10000);
    const pageSize = toPositiveInt(query.pageSize, 20);
    const result = await this.likeService.listBySpeak(speakId, page, pageSize);
    return new SuccessModal(result);
  }

  /**
   * 我点赞过的说说
   */
  @Get('/mine')
  async mine(@Query() query, @Request() req) {
    const page = toPositiveInt(query.page, 1, 10000);
    const pageSize = toPositiveInt(query.pageSize, 10);
    const result = await this.likeService.listByUser(req.user.userId, page, pageSize);
    return new SuccessModal(result);
  }
}
