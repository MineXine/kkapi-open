import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakExtService } from '../service/ispeakExt.service';
export declare class IspeakArchiveController {
    private readonly extService;
    constructor(extService: IspeakExtService);
    archive(req: any, body: any): Promise<SuccessModal | ErrorModal>;
    restore(req: any, body: any): Promise<SuccessModal | ErrorModal>;
    list(req: any, query: any): Promise<SuccessModal>;
}
