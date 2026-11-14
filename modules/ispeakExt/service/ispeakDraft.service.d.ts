/// <reference types="mongoose/types/PipelineStage" />
/// <reference types="mongoose/types/Error" />
import { Model } from 'mongoose';
import { IspeakDraftDocument } from '../schema/ispeakDraft.schema';
export interface DraftPayload {
    title?: string;
    content?: string;
    type?: string;
    tag?: string;
    showComment?: string;
    theme?: string;
    mdc?: Record<string, any> | null;
}
export declare class IspeakDraftService {
    private readonly draftModel;
    constructor(draftModel: Model<IspeakDraftDocument>);
    save(userId: string, draftId: string | undefined, payload: DraftPayload): Promise<import("mongoose").LeanDocument<import("../schema/ispeakDraft.schema").IspeakDraft & import("mongoose").Document<any, any, any> & {
        _id: any;
    }>>;
    list(userId: string, page?: number, limit?: number): Promise<{
        total: number;
        items: import("mongoose").LeanDocument<import("../schema/ispeakDraft.schema").IspeakDraft & import("mongoose").Document<any, any, any> & {
            _id: any;
        }>[];
    }>;
    findOne(userId: string, draftId: string): Promise<import("mongoose").LeanDocument<import("../schema/ispeakDraft.schema").IspeakDraft & import("mongoose").Document<any, any, any> & {
        _id: any;
    }>>;
    remove(userId: string, draftId: string): Promise<import("../schema/ispeakDraft.schema").IspeakDraft & import("mongoose").Document<any, any, any> & {
        _id: any;
    }>;
    countByUser(userId: string): Promise<number>;
}
