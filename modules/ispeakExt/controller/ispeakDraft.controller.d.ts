import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakService } from '../../ispeak/service/ispeak.service';
import { IspeakTagService } from '../../ispeak/service/ispeakTag.service';
import { IspeakDraftService } from '../service/ispeakDraft.service';
export declare class IspeakDraftController {
    private readonly draftService;
    private readonly ispeakService;
    private readonly tagService;
    constructor(draftService: IspeakDraftService, ispeakService: IspeakService, tagService: IspeakTagService);
    save(req: any, body: any): Promise<SuccessModal | ErrorModal>;
    list(req: any, query: any): Promise<SuccessModal>;
    detail(req: any, param: any): Promise<SuccessModal | ErrorModal>;
    remove(req: any, param: any): Promise<SuccessModal | ErrorModal>;
    publish(req: any, body: any): Promise<SuccessModal | ErrorModal>;
}
