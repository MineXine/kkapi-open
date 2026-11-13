import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ISpeakModelName, UserModelName } from 'src/constant/model-name';

export type IspeakFavoriteDocument = IspeakFavorite & mongoose.Document;

/**
 * 说说收藏关系表
 */
@Schema({ timestamps: true })
export class IspeakFavorite {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ISpeakModelName.ISpeakList, required: true })
  speakId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserModelName.User, required: true })
  userId: mongoose.Schema.Types.ObjectId;
}

export const IspeakFavoriteSchema = SchemaFactory.createForClass(IspeakFavorite);

// 同一用户对同一说说只能收藏一次
IspeakFavoriteSchema.index({ speakId: 1, userId: 1 }, { unique: true });
// 「我的收藏」按时间倒序分页
IspeakFavoriteSchema.index({ userId: 1, createdAt: -1 });
