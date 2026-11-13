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
exports.IspeakLikeController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const customize_1 = require("../../../common/decorator/customize");
const pagination_1 = require("../../../common/pagination");
const Response_modal_1 = require("../../../Model/Response.modal");
const ispeakExt_service_1 = require("../service/ispeakExt.service");
const ispeakLike_service_1 = require("../service/ispeakLike.service");
let IspeakLikeController = class IspeakLikeController {
    likeService;
    extService;
    constructor(likeService, extService) {
        this.likeService = likeService;
        this.extService = extService;
    }
    async toggle(req, body) {
        const { speakId } = body || {};
        if (!(0, mongoose_1.isValidObjectId)(speakId))
            return new Response_modal_1.ErrorModal(null, 'id不合法');
        const raw = await this.extService.findRaw(speakId);
        const invisible = this.extService.checkVisible(raw, req.user.userId);
        if (invisible)
            return new Response_modal_1.ErrorModal(null, invisible);
        const result = await this.likeService.toggle(speakId, req.user.userId);
        return new Response_modal_1.SuccessModal(result);
    }
    async list(query, req) {
        const { speakId } = query;
        if (!(0, mongoose_1.isValidObjectId)(speakId))
            return new Response_modal_1.ErrorModal(null, 'id不合法');
        const raw = await this.extService.findRaw(speakId);
        const invisible = this.extService.checkVisible(raw, req?.user?.userId);
        if (invisible)
            return new Response_modal_1.ErrorModal(null, invisible);
        const page = (0, pagination_1.toPositiveInt)(query.page, 1, 10000);
        const pageSize = (0, pagination_1.toPositiveInt)(query.pageSize, 20);
        const result = await this.likeService.listBySpeak(speakId, page, pageSize);
        return new Response_modal_1.SuccessModal(result);
    }
    async mine(query, req) {
        const page = (0, pagination_1.toPositiveInt)(query.page, 1, 10000);
        const pageSize = (0, pagination_1.toPositiveInt)(query.pageSize, 10);
        const result = await this.likeService.listByUser(req.user.userId, page, pageSize);
        return new Response_modal_1.SuccessModal(result);
    }
};
__decorate([
    (0, common_1.Post)('/toggle'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakLikeController.prototype, "toggle", null);
__decorate([
    (0, customize_1.IsLogin)(),
    (0, common_1.Get)('/list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakLikeController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('/mine'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakLikeController.prototype, "mine", null);
IspeakLikeController = __decorate([
    (0, common_1.Controller)('/ispeak/like'),
    __metadata("design:paramtypes", [ispeakLike_service_1.IspeakLikeService,
        ispeakExt_service_1.IspeakExtService])
], IspeakLikeController);
exports.IspeakLikeController = IspeakLikeController;
//# sourceMappingURL=ispeakLike.controller.js.map