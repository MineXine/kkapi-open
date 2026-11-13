"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IspeakExtModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const model_name_1 = require("../../constant/model-name");
const ispeak_module_1 = require("../ispeak/ispeak.module");
const ispeakExt_controller_1 = require("./controller/ispeakExt.controller");
const ispeakFavorite_controller_1 = require("./controller/ispeakFavorite.controller");
const ispeakLike_controller_1 = require("./controller/ispeakLike.controller");
const ispeakFavorite_schema_1 = require("./schema/ispeakFavorite.schema");
const ispeakLike_schema_1 = require("./schema/ispeakLike.schema");
const ispeakMeta_schema_1 = require("./schema/ispeakMeta.schema");
const ispeakExt_service_1 = require("./service/ispeakExt.service");
const ispeakFavorite_service_1 = require("./service/ispeakFavorite.service");
const ispeakLike_service_1 = require("./service/ispeakLike.service");
const ispeakMeta_service_1 = require("./service/ispeakMeta.service");
let IspeakExtModule = class IspeakExtModule {
};
IspeakExtModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ispeak_module_1.IspeakModule,
            mongoose_1.MongooseModule.forFeature([
                {
                    name: model_name_1.ISpeakModelName.ISpeakMeta,
                    schema: ispeakMeta_schema_1.IspeakMetaSchema,
                    collection: model_name_1.ISpeakModelName.ISpeakMeta,
                },
                {
                    name: model_name_1.ISpeakModelName.ISpeakLike,
                    schema: ispeakLike_schema_1.IspeakLikeSchema,
                    collection: model_name_1.ISpeakModelName.ISpeakLike,
                },
                {
                    name: model_name_1.ISpeakModelName.ISpeakFavorite,
                    schema: ispeakFavorite_schema_1.IspeakFavoriteSchema,
                    collection: model_name_1.ISpeakModelName.ISpeakFavorite,
                },
            ]),
        ],
        controllers: [ispeakExt_controller_1.IspeakExtController, ispeakLike_controller_1.IspeakLikeController, ispeakFavorite_controller_1.IspeakFavoriteController],
        providers: [ispeakExt_service_1.IspeakExtService, ispeakMeta_service_1.IspeakMetaService, ispeakLike_service_1.IspeakLikeService, ispeakFavorite_service_1.IspeakFavoriteService],
        exports: [ispeakExt_service_1.IspeakExtService, ispeakMeta_service_1.IspeakMetaService, ispeakLike_service_1.IspeakLikeService, ispeakFavorite_service_1.IspeakFavoriteService],
    })
], IspeakExtModule);
exports.IspeakExtModule = IspeakExtModule;
//# sourceMappingURL=ispeakExt.module.js.map