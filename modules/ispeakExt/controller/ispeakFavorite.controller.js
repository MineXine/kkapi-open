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
exports.IspeakFavoriteController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const pagination_1 = require("../../../common/pagination");
const Response_modal_1 = require("../../../Model/Response.modal");
const ispeakExt_service_1 = require("../service/ispeakExt.service");
const ispeakFavorite_service_1 = require("../service/ispeakFavorite.service");
let IspeakFavoriteController = class IspeakFavoriteController {
    favoriteService;
    extService;
    constructor(favoriteService, extService) {
        this.favoriteService = favoriteService;
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
        const result = await this.favoriteService.toggle(speakId, req.user.userId);
        return new Response_modal_1.SuccessModal(result);
    }
    async list(query, req) {
        const page = (0, pagination_1.toPositiveInt)(query.page, 1, 10000);
        const pageSize = (0, pagination_1.toPositiveInt)(query.pageSize, 10);
        const result = await this.favoriteService.listByUser(req.user.userId, page, pageSize);
        return new Response_modal_1.SuccessModal(result);
    }
    async users(query, req) {
        const { speakId } = query;
        if (!(0, mongoose_1.isValidObjectId)(speakId))
            return new Response_modal_1.ErrorModal(null, 'id不合法');
        const raw = await this.extService.findRaw(speakId);
        if (!raw)
            return new Response_modal_1.ErrorModal(null, '内容不存在');
        if (String(raw.author) !== String(req.user.userId))
            return new Response_modal_1.ErrorModal(null, '无权查看');
        const page = (0, pagination_1.toPositiveInt)(query.page, 1, 10000);
        const pageSize = (0, pagination_1.toPositiveInt)(query.pageSize, 20);
        const result = await this.favoriteService.listBySpeak(speakId, page, pageSize);
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
], IspeakFavoriteController.prototype, "toggle", null);
__decorate([
    (0, common_1.Get)('/list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakFavoriteController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('/users'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakFavoriteController.prototype, "users", null);
IspeakFavoriteController = __decorate([
    (0, common_1.Controller)('/ispeak/favorite'),
    __metadata("design:paramtypes", [ispeakFavorite_service_1.IspeakFavoriteService,
        ispeakExt_service_1.IspeakExtService])
], IspeakFavoriteController);
exports.IspeakFavoriteController = IspeakFavoriteController;
//# sourceMappingURL=ispeakFavorite.controller.js.map