import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakExtService } from '../service/ispeakExt.service';
import { IspeakLikeService } from '../service/ispeakLike.service';
export declare class IspeakLikeController {
    private readonly likeService;
    private readonly extService;
    constructor(likeService: IspeakLikeService, extService: IspeakExtService);
    toggle(req: any, body: any): Promise<SuccessModal | ErrorModal>;
    list(query: any, req: any): Promise<SuccessModal | ErrorModal>;
    mine(query: any, req: any): Promise<SuccessModal>;
}
