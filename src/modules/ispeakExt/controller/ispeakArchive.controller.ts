import { Body, Controller, Get, Patch, Query, Request } from '@nestjs/common';
import { toPositiveInt } from 'src/common/pagination';
import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakExtService } from '../service/ispeakExt.service';

/**
 * 归档 / 恢复
 *
 * 归档只写 archivedAt，既有列表接口已统一带 `archivedAt: null` 过滤，
 * 所以归档后对 /ispeak 与 /getByPage 都不可见，但作者仍可通过 detail 读到并恢复。
 */
@Controller('/ispeak')
export class IspeakArchiveController {
  constructor(private readonly extService: IspeakExtService) {}

  @Patch('/archive')
  async archive(@Request() req, @Body() body) {
    const error = await this.extService.setArchived(body?._id, req.user.userId, true);
    if (error) return new ErrorModal(null, error);
    return new SuccessModal({ archivedAt: new Date().toISOString() }, '已归档');
  }

  @Patch('/restore')
  async restore(@Request() req, @Body() body) {
    const error = await this.extService.setArchived(body?._id, req.user.userId, false);
    if (error) return new ErrorModal(null, error);
    return new SuccessModal({ archivedAt: null }, '已恢复');
  }

  @Get('/archived')
  async list(@Request() req, @Query() query) {
    const page = toPositiveInt(query.page, 1, 10000);
    const pageSize = toPositiveInt(query.pageSize, 10);
    const result = await this.extService.listArchived(req.user.userId, page, pageSize);
    return new SuccessModal(result);
  }
}
