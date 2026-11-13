import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import * as mongoose from 'mongoose';
import { ISpeakModelName, UserModelName } from 'src/constant/model-name';
import { IspeakTag } from './ipseakTag.schema';

export type IspeakDocument = Ispeak & Document;

@Schema({ timestamps: true })
export class Ispeak {
  /**
   * 标题
   */
  @Prop({ type: String, default: '' })
  title: string;

  /**
   * 内容
   */
  @IsNotEmpty({ message: '内容为必填项目哦！' })
  @Prop({ type: String, required: true })
  content: string;
  /**
   * 类型 0全部人可见 1仅登录可见 2仅自己可见
   */
  @Prop({ type: String, default: '0' })
  type: string;

  @IsNotEmpty({
    message: '标签为必填项目',
  })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ISpeakModelName.ISpeakTagList,
    required: true,
  })
  tag: IspeakTag;

  /**
   * 展示评论可被评论 0不可以被评论 1可以被评论
   */
  @Prop({ type: String, default: '1' })
  showComment: string;

  /**
   * 创建人
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserModelName.User, required: true })
  author: string;

  /**
   * 归档时间，null 表示未归档。归档后对既有列表/单条接口不可见
   */
  @Prop({ type: Date, default: null })
  archivedAt: Date;

  /**
   * 展示主题标识
   */
  @Prop({ type: String, default: 'default' })
  theme: string;

  /**
   * MDC 组件配置项（组件级配置覆盖，正文仍保留 ::组件{} 的 MDC 原生语法）
   */
  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  mdc: any;

  /**
   * 附件 id 列表（媒体模块接入后生效）
   */
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], default: [] })
  mediaIds: mongoose.Schema.Types.ObjectId[];

  /**
   * 发布坐标（GeoJSON Point）。地图视图所需的空间索引留待该功能上线时手工创建
   */
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: { type: [Number], default: undefined },
    name: { type: String, default: '' },
  })
  location: any;

  /**
   * 发布设备信息 { browser, browserVersion, os, osVersion, device, ua }
   */
  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  client: any;

  @Prop()
  updatedAt: Date;
  @Prop()
  createdAt: Date;
}

export const IspeakSchema = SchemaFactory.createForClass(Ispeak);
