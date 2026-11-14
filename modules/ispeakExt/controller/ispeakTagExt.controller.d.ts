import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakTagService } from '../../ispeak/service/ispeakTag.service';
import { IspeakExtService } from '../service/ispeakExt.service';
export declare class IspeakTagExtController {
    private readonly tagService;
    private readonly extService;
    constructor(tagService: IspeakTagService, extService: IspeakExtService);
    remove(req: any, param: any): Promise<SuccessModal | ErrorModal>;
}
