import { injectable, inject } from "inversify";
import { ISceneObjectBindingFactory, IMaxscriptClient, ISceneObjectBinding, ISessionPool, IGeometryCache, IMaterialCache } from "../../interfaces";
import { TYPES } from "../../types";
import { Session } from "../../database/model/session";
import { BoneBinding } from "../../maxscript/three_maxscript_bindings/bone_binding";

@injectable()
export class BoneBindingFactory implements ISceneObjectBindingFactory {
    private _maxscriptClientPool: ISessionPool<IMaxscriptClient>;

    public constructor(
        @inject(TYPES.IMaxscriptClientPool) maxscriptClientPool: ISessionPool<IMaxscriptClient>,
    ) {
        this._maxscriptClientPool = maxscriptClientPool;
    }

    public get SrcType(): string { return BoneBinding.SrcType }
    public get DstType(): string { return BoneBinding.DstType }

    public async Create(session: Session): Promise<ISceneObjectBinding>
    {
        let maxscript: IMaxscriptClient = await this._maxscriptClientPool.Get(session);
        return new BoneBinding(maxscript, null, null, session.workspaceRef);
    }
}
