import { IsArray, IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * 新建说说的入参
 *
 * 说明：全局 ValidationPipe 未开启 whitelist，未知字段不会被剥离，
 * 因此 controller 必须显式解构取值，不能把 body 直接落库。
 */
export class CreateIspeakDto {
  /** 正文（Markdown 原文） */
  @IsNotEmpty({ message: '内容为必填项目哦！' })
  @IsString({ message: '内容格式不正确' })
  content: string;

  /** 标题，可为空 */
  @IsOptional()
  @IsString({ message: '标题格式不正确' })
  title?: string;

  /** 标签 id */
  @IsNotEmpty({ message: '标签为必填项目' })
  @IsString({ message: '请传入标签的id' })
  tag: string;

  /** 可见性：public 落库 type '0'，private 落库 type '2' */
  @IsOptional()
  @IsIn(['public', 'private'], { message: '可见性取值不合法' })
  visibility?: string;

  /** 是否允许评论 */
  @IsOptional()
  @IsIn(['0', '1'], { message: '评论开关取值不合法' })
  showComment?: string;

  /** 展示主题标识（仅透传入库，主题注册表另行设计） */
  @IsOptional()
  @IsString({ message: '主题标识格式不正确' })
  theme?: string;

  /** MDC 组件配置项 */
  @IsOptional()
  @IsObject({ message: 'mdc 必须是对象' })
  mdc?: Record<string, any>;

  /** 附件 id 列表（媒体模块接入后生效） */
  @IsOptional()
  @IsArray({ message: 'mediaIds 必须是数组' })
  mediaIds?: string[];

  /** 地理坐标 { type:'Point', coordinates:[lng,lat], name? } */
  @IsOptional()
  @IsObject({ message: 'location 必须是对象' })
  location?: Record<string, any>;

  /** 客户端自行解析的设备信息，可覆盖服务端解析结果 */
  @IsOptional()
  @IsObject({ message: 'client 必须是对象' })
  client?: Record<string, any>;
}
