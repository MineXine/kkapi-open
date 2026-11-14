import * as mongoose from 'mongoose';
export declare type IspeakDraftDocument = IspeakDraft & mongoose.Document;
export declare class IspeakDraft {
    user: mongoose.Schema.Types.ObjectId;
    title: string;
    content: string;
    type: string;
    tag: mongoose.Schema.Types.ObjectId;
    showComment: string;
    theme: string;
    mdc: any;
}
export declare const IspeakDraftSchema: mongoose.Schema<mongoose.Document<IspeakDraft, any, any>, mongoose.Model<mongoose.Document<IspeakDraft, any, any>, any, any, any>, any, any>;
