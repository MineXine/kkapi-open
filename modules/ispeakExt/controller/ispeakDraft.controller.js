"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IspeakDraftController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const pagination_1 = require("../../../common/pagination");
const Response_modal_1 = require("../../../Model/Response.modal");
const ispeak_service_1 = require("../../ispeak/service/ispeak.service");
const ispeakTag_service_1 = require("../../ispeak/service/ispeakTag.service");
const ispeakDraft_service_1 = require("../service/ispeakDraft.service");
const DRAFT_LIMIT = 200;
let IspeakDraftController = class IspeakDraftController {
    draftService;
    ispeakService;
    tagService;
    constructor(draftService, ispeakService, tagService) {
        this.draftService = draftService;
        this.ispeakService = ispeakService;
        this.tagService = tagService;
    }
    async save(req, body) {
        const userId = req.user.userId;
        const { draftId, title, content, type, tag, showComment, theme, mdc } = body || {};
        if (tag && !(0, mongoose_1.isValidObjectId)(tag))
            return new Response_modal_1.ErrorModal(null, '标签 id 不合法');
        if (type && !['0', '1', '2'].includes(String(type))) {
            return new Response_modal_1.ErrorModal(null, '可见性取值不合法');
        }
        if (!draftId) {
            const count = await this.draftService.countByUser(userId);
            if (count >= DRAFT_LIMIT)
                return new Response_modal_1.ErrorModal(null, '草稿数量已达上限，请先清理');
        }
        const payload = {
            title: String(title || '').slice(0, 120),
            content: String(content || ''),
            type: type ? String(type) : '0',
            showComment: showComment === '0' ? '0' : '1',
            theme: theme ? String(theme) : 'default',
            mdc: mdc && typeof mdc === 'object' ? mdc : null,
        };
        if (tag)
            payload.tag = tag;
        const doc = await this.draftService.save(userId, draftId, payload);
        if (!doc)
            return new Response_modal_1.ErrorModal(null, '草稿不存在');
        return new Response_modal_1.SuccessModal({
            draftId: String(doc._id),
            savedAt: doc.updatedAt || new Date().toISOString(),
        });
    }
    async list(req, query) {
        const page = (0, pagination_1.toPositiveInt)(query.page, 1, 10000);
        const pageSize = (0, pagination_1.toPositiveInt)(query.pageSize, 20);
        const result = await this.draftService.list(req.user.userId, page, pageSize);
        return new Response_modal_1.SuccessModal(result);
    }
    async detail(req, param) {
        const doc = await this.draftService.findOne(req.user.userId, param.id);
        if (!doc)
            return new Response_modal_1.ErrorModal(null, '草稿不存在');
        return new Response_modal_1.SuccessModal(doc);
    }
    async remove(req, param) {
        if (!(0, mongoose_1.isValidObjectId)(param.id))
            return new Response_modal_1.ErrorModal(null, 'id不合法');
        const doc = await this.draftService.remove(req.user.userId, param.id);
        if (!doc)
            return new Response_modal_1.ErrorModal(null, '草稿不存在');
        return new Response_modal_1.SuccessModal({ deleted: 1 }, '已删除');
    }
    async publish(req, body) {
        const userId = req.user.userId;
        const draftId = body?.draftId;
        if (!(0, mongoose_1.isValidObjectId)(draftId))
            return new Response_modal_1.ErrorModal(null, 'id不合法');
        const draft = await this.draftService.findOne(userId, draftId);
        if (!draft)
            return new Response_modal_1.ErrorModal(null, '草稿不存在');
        if (!draft.content || !String(draft.content).trim()) {
            return new Response_modal_1.ErrorModal(null, '正文不能为空');
        }
        if (!draft.tag || !(0, mongoose_1.isValidObjectId)(draft.tag)) {
            return new Response_modal_1.ErrorModal(null, '请选择一个标签');
        }
        const tagDoc = await this.tagService.findOneTag({ _id: draft.tag, user: userId });
        if (!tagDoc)
            return new Response_modal_1.ErrorModal(null, '标签已不存在，请重新选择');
        const speak = await this.ispeakService.addOneSpeak({
            title: draft.title || '',
            content: draft.content,
            type: draft.type || '0',
            tag: draft.tag,
            showComment: draft.showComment === '0' ? '0' : '1',
            theme: draft.theme || 'default',
            mdc: draft.mdc || null,
            author: userId,
        });
        await this.draftService.remove(userId, draftId);
        return new Response_modal_1.SuccessModal({ _id: String(speak._id) }, '已发布');
    }
};
__decorate([
    (0, common_1.Post)('/save'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakDraftController.prototype, "save", null);
__decorate([
    (0, common_1.Get)('/list'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakDraftController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('/get/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakDraftController.prototype, "detail", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakDraftController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('/publish'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakDraftController.prototype, "publish", null);
IspeakDraftController = __decorate([
    (0, common_1.Controller)('/ispeak/draft'),
    __metadata("design:paramtypes", [ispeakDraft_service_1.IspeakDraftService,
        ispeak_service_1.IspeakService,
        ispeakTag_service_1.IspeakTagService])
], IspeakDraftController);
exports.IspeakDraftController = IspeakDraftController;
//# sourceMappingURL=ispeakDraft.controller.js.map