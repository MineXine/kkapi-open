import * as mongoose from 'mongoose';
export declare type IspeakLikeDocument = IspeakLike & mongoose.Document;
export declare class IspeakLike {
    speakId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
}
export declare const IspeakLikeSchema: mongoose.Schema<mongoose.Document<IspeakLike, any, any>, mongoose.Model<mongoose.Document<IspeakLike, any, any>, any, any, any>, any, any>;
