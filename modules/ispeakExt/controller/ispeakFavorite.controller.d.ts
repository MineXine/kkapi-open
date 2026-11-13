import { ErrorModal, SuccessModal } from 'src/Model/Response.modal';
import { IspeakExtService } from '../service/ispeakExt.service';
import { IspeakFavoriteService } from '../service/ispeakFavorite.service';
export declare class IspeakFavoriteController {
    private readonly favoriteService;
    private readonly extService;
    constructor(favoriteService: IspeakFavoriteService, extService: IspeakExtService);
    toggle(req: any, body: any): Promise<SuccessModal | ErrorModal>;
    list(query: any, req: any): Promise<SuccessModal>;
    users(query: any, req: any): Promise<SuccessModal | ErrorModal>;
}
