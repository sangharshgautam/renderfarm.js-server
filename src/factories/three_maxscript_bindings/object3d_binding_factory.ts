import { injectable, inject } from "inversify";
import { ISceneObjectBindingFactory, IMaxscriptClient, ISceneObjectBinding, ISessionPool, IGeometryCache, IMaterialCache } from "../../interfaces";
import { TYPES } from "../../types";
import { Session } from "../../database/model/session";
import { Object3DBinding } from "../../maxscript/three_maxscript_bindings/object3d_binding";

@injectable()
export class Object3DBindingFactory implements ISceneObjectBindingFactory {
    private _maxscriptClientPool: ISessionPool<IMaxscriptClient>;

    public constructor(
        @inject(TYPES.IMaxscriptClientPool) maxscriptClientPool: ISessionPool<IMaxscriptClient>,
    ) {
        this._maxscriptClientPool = maxscriptClientPool;
    }

    public get SrcType(): string { return Object3DBinding.SrcType }
    public get DstType(): string { return Object3DBinding.DstType }

    public async Create(session: Session): Promise<ISceneObjectBinding>
    {
        let maxscript: IMaxscriptClient = await this._maxscriptClientPool.Get(session);
        return new Object3DBinding(maxscript, geometryCache, materialCache, session.workspaceRef);
    }
}
