import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { IFactory, ISessionService, ITextureCache } from "../../interfaces";

import { Session } from "../../database/model/session";
import { SessionPoolBase } from "../../core/session_pool_base";

@injectable()
export class TextureCachePool extends SessionPoolBase<ITextureCache> {

    constructor(
        @inject(TYPES.ISessionService) sessionService: ISessionService,
        @inject(TYPES.ITextureCacheFactory) sessionTextureCacheFactory: IFactory<ITextureCache>,
    ) {
        super(sessionService, sessionTextureCacheFactory.Create.bind(sessionTextureCacheFactory));

        this.id = Math.random();
        console.log(" >> TextureCachePool: ", this.id);
    }

    public id: number;

    protected async onBeforeItemAdd(session: Session, materialCache: ITextureCache): Promise<boolean> {
        return true;
    }

    protected async onBeforeItemRemove(closedSession: Session, materialCache: ITextureCache): Promise<any> {
        // do nothing
    }
}
