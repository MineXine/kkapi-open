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
exports.IspeakTagExtController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const Response_modal_1 = require("../../../Model/Response.modal");
const ispeakTag_service_1 = require("../../ispeak/service/ispeakTag.service");
const ispeakExt_service_1 = require("../service/ispeakExt.service");
let IspeakTagExtController = class IspeakTagExtController {
    tagService;
    extService;
    constructor(tagService, extService) {
        this.tagService = tagService;
        this.extService = extService;
    }
    async remove(req, param) {
        if (!(0, mongoose_1.isValidObjectId)(param.id))
            return new Response_modal_1.ErrorModal(null, 'id不合法');
        const userId = req.user.userId;
        const tag = await this.tagService.findOneTag({ _id: param.id, user: userId });
        if (!tag)
            return new Response_modal_1.ErrorModal(null, '标签不存在');
        const used = await this.extService.countByTag(param.id);
        if (used > 0) {
            return new Response_modal_1.ErrorModal(null, `该标签下还有 ${used} 条说说，请先改到其他标签`);
        }
        await this.tagService.deleteOneTag({ _id: param.id, user: userId });
        return new Response_modal_1.SuccessModal({ deleted: 1 }, '已删除');
    }
};
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakTagExtController.prototype, "remove", null);
IspeakTagExtController = __decorate([
    (0, common_1.Controller)('/ispeak/tag'),
    __metadata("design:paramtypes", [ispeakTag_service_1.IspeakTagService,
        ispeakExt_service_1.IspeakExtService])
], IspeakTagExtController);
exports.IspeakTagExtController = IspeakTagExtController;
//# sourceMappingURL=ispeakTagExt.controller.js.map