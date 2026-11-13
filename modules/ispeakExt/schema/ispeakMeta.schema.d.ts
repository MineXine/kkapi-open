import * as mongoose from 'mongoose';
export declare type IspeakMetaDocument = IspeakMeta & mongoose.Document;
export declare class IspeakMeta {
    speakId: mongoose.Schema.Types.ObjectId;
    likeCount: number;
    favoriteCount: number;
    shareCount: number;
    readCount: number;
}
export declare const IspeakMetaSchema: mongoose.Schema<mongoose.Document<IspeakMeta, any, any>, mongoose.Model<mongoose.Document<IspeakMeta, any, any>, any, any, any>, any, any>;
