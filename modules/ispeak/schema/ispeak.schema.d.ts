import * as mongoose from 'mongoose';
import { IspeakTag } from './ipseakTag.schema';
export declare type IspeakDocument = Ispeak & Document;
export declare class Ispeak {
    title: string;
    content: string;
    type: string;
    tag: IspeakTag;
    showComment: string;
    author: string;
    archivedAt: Date;
    theme: string;
    mdc: any;
    mediaIds: mongoose.Schema.Types.ObjectId[];
    location: any;
    client: any;
    updatedAt: Date;
    createdAt: Date;
}
export declare const IspeakSchema: mongoose.Schema<mongoose.Document<Ispeak, any, any>, mongoose.Model<mongoose.Document<Ispeak, any, any>, any, any, any>, any, any>;
