import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakTagService } from '../../ispeak/service/ispeakTag.service';
import { CreateIspeakDto } from '../dto/create-ispeak.dto';
import { IspeakExtService } from '../service/ispeakExt.service';
export declare class IspeakExtController {
    private readonly extService;
    private readonly tagService;
    constructor(extService: IspeakExtService, tagService: IspeakTagService);
    createOne(req: any, body: CreateIspeakDto): Promise<SuccessModal | ErrorModal>;
    getDetail(param: any, req: any): Promise<SuccessModal | ErrorModal>;
}
