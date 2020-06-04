import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { IFactory, ISessionService, IImageCache } from "../../interfaces";

import { Session } from "../../database/model/session";
import { SessionPoolBase } from "../../core/session_pool_base";

@injectable()
export class ImageCachePool extends SessionPoolBase<IImageCache> {

    constructor(
        @inject(TYPES.ISessionService) sessionService: ISessionService,
        @inject(TYPES.IImageCacheFactory) sessionImageCacheFactory: IFactory<IImageCache>,
    ) {
        super(sessionService, sessionImageCacheFactory.Create.bind(sessionImageCacheFactory));

        this.id = Math.random();
        console.log(" >> ImageCachePool: ", this.id);
    }

    public id: number;

    protected async onBeforeItemAdd(session: Session, materialCache: IImageCache): Promise<boolean> {
        return true;
    }

    protected async onBeforeItemRemove(closedSession: Session, materialCache: IImageCache): Promise<any> {
        // do nothing
    }
}
