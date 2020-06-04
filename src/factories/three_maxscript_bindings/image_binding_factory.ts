import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { IMaxscriptClient, IImageBinding, IFactory, ISessionPool } from "../../interfaces";
import { ImageBinding } from "../../maxscript/three_maxscript_bindings/image_binding";
import { Session } from "../../database/model/session";

@injectable()
export class ImageBindingFactory implements IFactory<IImageBinding> {
    private _maxscriptClientPool: ISessionPool<IMaxscriptClient>;
    
    public constructor(
        @inject(TYPES.IMaxscriptClientPool) maxscriptClientPool: ISessionPool<IMaxscriptClient>,
    ) {
        this._maxscriptClientPool = maxscriptClientPool;
    }

    public async Create(session: Session, imageJson: any): Promise<IImageBinding> 
    {
        let maxscript: IMaxscriptClient = await this._maxscriptClientPool.Get(session);
        return new ImageBinding(maxscript, imageJson);
    }
}
