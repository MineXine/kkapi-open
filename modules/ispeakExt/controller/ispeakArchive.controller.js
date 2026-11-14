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
exports.IspeakArchiveController = void 0;
const common_1 = require("@nestjs/common");
const pagination_1 = require("../../../common/pagination");
const Response_modal_1 = require("../../../Model/Response.modal");
const ispeakExt_service_1 = require("../service/ispeakExt.service");
let IspeakArchiveController = class IspeakArchiveController {
    extService;
    constructor(extService) {
        this.extService = extService;
    }
    async archive(req, body) {
        const error = await this.extService.setArchived(body?._id, req.user.userId, true);
        if (error)
            return new Response_modal_1.ErrorModal(null, error);
        return new Response_modal_1.SuccessModal({ archivedAt: new Date().toISOString() }, '已归档');
    }
    async restore(req, body) {
        const error = await this.extService.setArchived(body?._id, req.user.userId, false);
        if (error)
            return new Response_modal_1.ErrorModal(null, error);
        return new Response_modal_1.SuccessModal({ archivedAt: null }, '已恢复');
    }
    async list(req, query) {
        const page = (0, pagination_1.toPositiveInt)(query.page, 1, 10000);
        const pageSize = (0, pagination_1.toPositiveInt)(query.pageSize, 10);
        const result = await this.extService.listArchived(req.user.userId, page, pageSize);
        return new Response_modal_1.SuccessModal(result);
    }
};
__decorate([
    (0, common_1.Patch)('/archive'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakArchiveController.prototype, "archive", null);
__decorate([
    (0, common_1.Patch)('/restore'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakArchiveController.prototype, "restore", null);
__decorate([
    (0, common_1.Get)('/archived'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IspeakArchiveController.prototype, "list", null);
IspeakArchiveController = __decorate([
    (0, common_1.Controller)('/ispeak'),
    __metadata("design:paramtypes", [ispeakExt_service_1.IspeakExtService])
], IspeakArchiveController);
exports.IspeakArchiveController = IspeakArchiveController;
//# sourceMappingURL=ispeakArchive.controller.js.map