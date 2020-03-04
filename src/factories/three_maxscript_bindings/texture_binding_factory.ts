import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { IMaxscriptClient, ITextureBinding, IFactory, ISessionPool } from "../../interfaces";
import { TextureBinding } from "../../maxscript/three_maxscript_bindings/texture_binding";
import { Session } from "../../database/model/session";

@injectable()
export class TextureBindingFactory implements IFactory<ITextureBinding> {
    private _maxscriptClientPool: ISessionPool<IMaxscriptClient>;
    
    public constructor(
        @inject(TYPES.IMaxscriptClientPool) maxscriptClientPool: ISessionPool<IMaxscriptClient>,
    ) {
        this._maxscriptClientPool = maxscriptClientPool;
    }

    public async Create(session: Session, textureJson: any): Promise<ITextureBinding> 
    {
        let maxscript: IMaxscriptClient = await this._maxscriptClientPool.Get(session);
        return new TextureBinding(maxscript, textureJson);
    }
}
