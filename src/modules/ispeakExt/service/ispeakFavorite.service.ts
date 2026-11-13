import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ISpeakModelName, UserModelName } from 'src/constant/model-name';
import { IspeakFavorite, IspeakFavoriteDocument } from '../schema/ispeakFavorite.schema';
import { IspeakMetaService } from './ispeakMeta.service';

@Injectable()
export class IspeakFavoriteService {
  constructor(
    @InjectModel(ISpeakModelName.ISpeakFavorite)
    private readonly favoriteModel: Model<IspeakFavoriteDocument>,
    private readonly metaService: IspeakMetaService,
  ) {}

  /**
   * 收藏 / 取消收藏（并发语义同点赞，靠唯一索引兜底）
   */
  async toggle(speakId: string, userId: string) {
    const removed = await this.favoriteModel.findOneAndDelete({ speakId, userId }).lean().exec();
    if (removed) {
      const meta = await this.metaService.inc(speakId, 'favoriteCount', -1);
      return {
        favorited: false,
        favoriteCount: this.metaService.pickCount(meta as any, 'favoriteCount'),
      };
    }

    let created = false;
    try {
      await this.favoriteModel.create({ speakId, userId });
      created = true;
    } catch (error) {
      if (error?.code !== 11000) throw error;
    }

    if (!created) {
      const current = await this.metaService.get(speakId);
      return {
        favorited: true,
        favoriteCount: this.metaService.pickCount(current as any, 'favoriteCount'),
      };
    }

    const meta = await this.metaService.inc(speakId, 'favoriteCount', 1);
    return {
      favorited: true,
      favoriteCount: this.metaService.pickCount(meta as any, 'favoriteCount'),
    };
  }

  /**
   * 当前用户是否已收藏
   */
  async isFavorited(speakId: string, userId: string): Promise<boolean> {
    if (!userId) return false;
    const doc = await this.favoriteModel.findOne({ speakId, userId }).lean().exec();
    return !!doc;
  }

  /**
   * 某条说说的收藏者列表（仅作者可查，权限在 controller 判定）
   */
  async listBySpeak(speakId: string, page = 1, limit = 20) {
    const result = await this.favoriteModel
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
   * 我的收藏（已过滤归档与他人私密内容）
   */
  async listByUser(userId: string, page = 1, limit = 10) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const result = await this.favoriteModel
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
                  favoritedAt: '$createdAt',
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

  private shapeFacet(result: any[]) {
    const faced = result && result[0] ? result[0] : null;
    const total = faced && faced.total && faced.total[0] ? faced.total[0].total : 0;
    return { total, items: faced ? faced.items : [] };
  }
}
