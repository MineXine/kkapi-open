import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId } from 'mongoose';
import { Model } from 'mongoose';
import { ISpeakModelName } from 'src/constant/model-name';
import { IspeakDraftDocument } from '../schema/ispeakDraft.schema';

/** 允许写入草稿的字段，避免把 body 整体落库 */
export interface DraftPayload {
  title?: string;
  content?: string;
  type?: string;
  tag?: string;
  showComment?: string;
  theme?: string;
  mdc?: Record<string, any> | null;
}

@Injectable()
export class IspeakDraftService {
  constructor(
    @InjectModel(ISpeakModelName.ISpeakDraft)
    private readonly draftModel: Model<IspeakDraftDocument>,
  ) {}

  /**
   * 保存草稿：带 draftId 则更新，否则新建
   * @returns 命中的草稿；draftId 不存在或不属于当前用户时返回 null
   */
  async save(userId: string, draftId: string | undefined, payload: DraftPayload) {
    if (draftId) {
      if (!isValidObjectId(draftId)) return null;
      return this.draftModel
        .findOneAndUpdate({ _id: draftId, user: userId }, { $set: payload }, { new: true })
        .lean()
        .exec();
    }
    return this.draftModel.create({ ...payload, user: userId });
  }

  async list(userId: string, page = 1, limit = 20) {
    const filter = { user: userId };
    const [total, items] = await Promise.all([
      this.draftModel.countDocuments(filter).exec(),
      this.draftModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
    ]);
    return { total, items };
  }

  async findOne(userId: string, draftId: string) {
    if (!isValidObjectId(draftId)) return null;
    return this.draftModel.findOne({ _id: draftId, user: userId }).lean().exec();
  }

  async remove(userId: string, draftId: string) {
    if (!isValidObjectId(draftId)) return null;
    return this.draftModel.findOneAndDelete({ _id: draftId, user: userId }).exec();
  }

  async countByUser(userId: string) {
    return this.draftModel.countDocuments({ user: userId }).exec();
  }
}
