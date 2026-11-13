import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ISpeakModelName, UserModelName } from 'src/constant/model-name';
import { IspeakLike, IspeakLikeDocument } from '../schema/ispeakLike.schema';
import { IspeakMetaService } from './ispeakMeta.service';

@Injectable()
export class IspeakLikeService {
  constructor(
    @InjectModel(ISpeakModelName.ISpeakLike)
    private readonly likeModel: Model<IspeakLikeDocument>,
    private readonly metaService: IspeakMetaService,
  ) {}

  /**
   * 点赞 / 取消点赞
   *
   * 去重与并发安全全部依赖 { speakId, userId } 唯一索引：
   * 先尝试删除（取消），删不到再插入（点赞）。插入命中唯一索引说明并发请求已经写入，
   * 此时不再重复 +1，避免「一行记录、两次计数」。
   */
  async toggle(speakId: string, userId: string) {
    const removed = await this.likeModel.findOneAndDelete({ speakId, userId }).lean().exec();
    if (removed) {
      const meta = await this.metaService.inc(speakId, 'likeCount', -1);
      return {
        liked: false,
        likeCount: this.metaService.pickCount(meta as any, 'likeCount'),
      };
    }

    let created = false;
    try {
      await this.likeModel.create({ speakId, userId });
      created = true;
    } catch (error) {
      // 11000 = duplicate key，说明并发下已存在点赞记录，按「已点赞」返回
      if (error?.code !== 11000) throw error;
    }

    if (!created) {
      const current = await this.metaService.get(speakId);
      return {
        liked: true,
        likeCount: this.metaService.pickCount(current as any, 'likeCount'),
      };
    }

    const meta = await this.metaService.inc(speakId, 'likeCount', 1);
    return {
      liked: true,
      likeCount: this.metaService.pickCount(meta as any, 'likeCount'),
    };
  }

  /**
   * 当前用户是否已点赞
   */
  async isLiked(speakId: string, userId: string): Promise<boolean> {
    if (!userId) return false;
    const doc = await this.likeModel.findOne({ speakId, userId }).lean().exec();
    return !!doc;
  }

  /**
   * 某条说说的点赞者列表
   */
  async listBySpeak(speakId: string, page = 1, limit = 20) {
    const result = await this.likeModel
      .aggregate([
        { $match: { speakId: new mongoose.Types.ObjectId(speakId) } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            total: [{ $count: 'total' }],
            items: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              {
                $lookup: {
                  from: UserModelName.User,
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'user',
                },
              },
              {
                $project: {
                  _id: 1,
                  userId: 1,
                  createdAt: 1,
                  nickName: { $arrayElemAt: ['$user.nickName', 0] },
                  avatar: { $arrayElemAt: ['$user.avatar', 0] },
                  link: { $arrayElemAt: ['$user.link', 0] },
                },
              },
            ],
          },
        },
      ])
      .exec();

    return this.shapeFacet(result);
  }

  /**
   * 我点赞过的说说（已过滤归档与他人私密内容）
   */
  async listByUser(userId: string, page = 1, limit = 10) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const result = await this.likeModel
      .aggregate([
        { $match: { userId: userObjectId } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: ISpeakModelName.ISpeakList,
            localField: 'speakId',
            foreignField: '_id',
            as: 'speak',
          },
        },
        { $unwind: '$speak' },
        {
          $match: {
            // 归档内容不出现在任何列表；{ archivedAt: null } 同时匹配 null 与字段缺失
            'speak.archivedAt': null,
            $or: [
              { 'speak.type': { $in: ['0', '1'] } },
              { 'speak.type': '2', 'speak.author': userObjectId },
            ],
          },
        },
        {
          $facet: {
            total: [{ $count: 'total' }],
            items: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              {
                $lookup: {
                  from: ISpeakModelName.ISpeakTagList,
                  localField: 'speak.tag',
                  foreignField: '_id',
                  as: 'tag',
                },
              },
              {
                $project: {
                  _id: 0,
                  speakId: '$speak._id',
                  title: '$speak.title',
                  content: '$speak.content',
                  type: '$speak.type',
                  createdAt: '$speak.createdAt',
                  likedAt: '$createdAt',
                  tag: { $arrayElemAt: ['$tag', 0] },
                },
              },
            ],
          },
        },
      ])
      .exec();

    return this.shapeFacet(result);
  }

  /**
   * $facet 结果为 [{ total: [{total:n}], items: [...] }]，统一拍平
   */
  private shapeFacet(result: any[]) {
    const faced = result && result[0] ? result[0] : null;
    const total = faced && faced.total && faced.total[0] ? faced.total[0].total : 0;
    return { total, items: faced ? faced.items : [] };
  }
}
