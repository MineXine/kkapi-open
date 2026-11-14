import { Controller, Delete, Param, Request } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakTagService } from '../../ispeak/service/ispeakTag.service';
import { IspeakExtService } from '../service/ispeakExt.service';

/**
 * 标签删除
 *
 * 单独放在扩展模块，不往既有 IspeakTagController 里加路由：
 * 那边一个字符都不动，回归面最小。
 */
@Controller('/ispeak/tag')
export class IspeakTagExtController {
  constructor(
    private readonly tagService: IspeakTagService,
    private readonly extService: IspeakExtService,
  ) {}

  @Delete('/:id')
  async remove(@Request() req, @Param() param) {
    if (!isValidObjectId(param.id)) return new ErrorModal(null, 'id不合法');

    const userId = req.user.userId;
    const tag = await this.tagService.findOneTag({ _id: param.id, user: userId });
    if (!tag) return new ErrorModal(null, '标签不存在');

    // 说说必须挂标签，直接删会留下孤儿数据，先拦住并告知占用数量
    const used = await this.extService.countByTag(param.id);
    if (used > 0) {
      return new ErrorModal(null, `该标签下还有 ${used} 条说说，请先改到其他标签`);
    }

    await this.tagService.deleteOneTag({ _id: param.id, user: userId });
    return new SuccessModal({ deleted: 1 }, '已删除');
  }
}
