import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { IsLogin } from 'src/common/decorator/customize';
import { mergeClientInfo } from 'src/common/ua';
import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakTagService } from '../../ispeak/service/ispeakTag.service';
import { CreateIspeakDto } from '../dto/create-ispeak.dto';
import { IspeakExtService } from '../service/ispeakExt.service';

@Controller('/ispeak')
export class IspeakExtController {
  constructor(
    private readonly extService: IspeakExtService,
    private readonly tagService: IspeakTagService,
  ) {}

  /**
   * 新建说说（v2 写入）
   *
   * 与既有 POST /ispeak/add 的区别：支持可见性语义、MDC 配置、附件、坐标、设备信息，
   * 且校验标签归属。/add 保持原样，不做任何改动。
   */
  @Post('/create')
  async createOne(@Request() req, @Body() body: CreateIspeakDto) {
    const userId = req.user.userId;
    const {
      content,
      title = '',
      tag,
      visibility = 'public',
      showComment = '1',
      theme = 'default',
      mdc,
      mediaIds,
      location,
      client,
    } = body;

    if (!isValidObjectId(tag)) return new ErrorModal(null, '请传入标签的id');

    // 标签必须存在且属于当前用户；既有 /add 未做此校验，此处更严格但不影响旧接口
    const tagDoc = await this.tagService.findOneTag({ _id: tag, user: userId });
    if (!tagDoc) return new ErrorModal(null, '标签不存在');

    // 入参用 public/private，落库仍沿用 type 的 '0'/'2'，不扩展枚举
    const type = visibility === 'private' ? '2' : '0';
    const clientInfo = mergeClientInfo(req.headers['user-agent'] as string, client);

    const doc = await this.extService.createOne({
      title,
      content,
      type,
      tag,
      showComment,
      theme,
      mdc: mdc || null,
      mediaIds: Array.isArray(mediaIds)
        ? mediaIds.filter((item) => isValidObjectId(item))
        : [],
      ...(location && location.type === 'Point' && Array.isArray(location.coordinates)
        ? { location }
        : {}),
      author: userId,
      client: clientInfo,
    });

    const detail = await this.extService.getDetail(String(doc._id), userId);
    if (detail.error) return new ErrorModal(null, detail.error);
    return new SuccessModal(detail.data);
  }

  /**
   * 详情聚合
   *
   * 与既有 GET /ispeak/get/:id 的区别：带可见性校验（旧接口对 type='2' 不做拦截），
   * 并返回计数、当前用户互动状态、设备信息。旧接口保持不变。
   */
  @IsLogin()
  @Get('/detail/:id')
  async getDetail(@Param() param, @Request() req) {
    const viewerId = req?.user?.userId;
    const result = await this.extService.getDetail(param.id, viewerId);
    if (result.error) return new ErrorModal(null, result.error);
    return new SuccessModal(result.data);
  }
}
