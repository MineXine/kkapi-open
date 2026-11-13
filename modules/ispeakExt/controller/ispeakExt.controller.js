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
exports.IspeakExtController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const customize_1 = require("../../../common/decorator/customize");
const ua_1 = require("../../../common/ua");
const Response_modal_1 = require("../../../Model/Response.modal");
const ispeakTag_service_1 = require("../../ispeak/service/ispeakTag.service");
const create_ispeak_dto_1 = require("../dto/create-ispeak.dto");
const ispeakExt_service_1 = require("../service/ispeakExt.service");
let IspeakExtController = class IspeakExtController {
    extService;
    tagService;
    constructor(extService, tagService) {
        this.extService = extService;
        this.tagService = tagService;
    }
    async createOne(req, body) {
        const userId = req.user.userId;
        const { content, title = '', tag, visibility = 'public', showComment = '1', theme = 'default', mdc, mediaIds, location, client, } = body;
        if (!(0, mongoose_1.isValidObjectId)(tag))
            return new Response_modal_1.ErrorModal(null, '请传入标签的id');
        const tagDoc = await this.tagService.findOneTag({ _id: tag, user: userId });
        if (!tagDoc)
            return new Response_modal_1.ErrorModal(null, '标签不存在');
        const type = visibility === 'private' ? '2' : '0';
        const clientInfo = (0, ua_1.mergeClientInfo)(req.headers['user-agent'], client);
        const doc = await this.extService.createOne({
            title,
            content,
            type,
            tag,
            showComment,
            theme,
            mdc: mdc || null,
            mediaIds: Array.isArray(mediaIds)
                ? mediaIds.filter((item) => (0, mongoose_1.isValidObjectId)(item))
                : [],
            ...(location && location.type === 'Point' && Array.isArray(location.coordinates)
                ? { location }
                : {}),
            author: userId,
            client: clientInfo,
        });
        const detail = await this.extService.getDetail(String(doc._id), userId);
        if (detail.error)
            return new Response_modal_1.ErrorModal(null, detail.error);
        return new Response_modal_1.SuccessModal(detail.data);
    }
    async getDetail(param, req) {
        const viewerId = req?.user?.userId;
        const result = await this.extService.getDetail(param.id, viewerId);
        if (result.error)
            return new Response_modal_1.ErrorModal(null, result.error);
        return new Response_modal_1.SuccessModal(result.data);
    }
};
__decorate([
    (0, common_1.Post)('/create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_ispeak_dto_1.CreateIspeakDto]),
    __metadata("design:returntype", Promise)
], IspeakExtController.prototype, "createOne", null);
__decorate([
    (0, customize_1.IsLogin)(),
    (0, common_1.Get)('/detail/:id'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakExtController.prototype, "getDetail", null);
IspeakExtController = __decorate([
    (0, common_1.Controller)('/ispeak'),
    __metadata("design:paramtypes", [ispeakExt_service_1.IspeakExtService,
        ispeakTag_service_1.IspeakTagService])
], IspeakExtController);
exports.IspeakExtController = IspeakExtController;
//# sourceMappingURL=ispeakExt.controller.js.map