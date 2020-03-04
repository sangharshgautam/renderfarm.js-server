import { injectable, inject } from "inversify";
import { ISceneObjectBindingFactory, IMaxscriptClient, ISceneObjectBinding, ISessionPool, IGeometryCache, IMaterialCache, IImageCache, ITextureCache } from "../../interfaces";
import { TYPES } from "../../types";
import { Session } from "../../database/model/session";
import { MeshBinding } from "../../maxscript/three_maxscript_bindings/mesh_binding";

@injectable()
export class MeshBindingFactory implements ISceneObjectBindingFactory {
    private _maxscriptClientPool: ISessionPool<IMaxscriptClient>;
    private _geometryCachePool: ISessionPool<IGeometryCache>;
    private _materialCachePool: ISessionPool<IMaterialCache>;
    private _textureCachePool: ISessionPool<ITextureCache>;
    private _imageCachePool: ISessionPool<IImageCache>;

    public constructor(
        @inject(TYPES.IMaxscriptClientPool) maxscriptClientPool: ISessionPool<IMaxscriptClient>,
        @inject(TYPES.IGeometryCachePool) geometryCachePool: ISessionPool<IGeometryCache>,
        @inject(TYPES.IMaterialCachePool) materialCachePool: ISessionPool<IMaterialCache>,
        @inject(TYPES.ITextureCachePool) textureCachePool: ISessionPool<ITextureCache>,
        @inject(TYPES.IImageCachePool) imageCachePool: ISessionPool<IImageCache>,
    ) {
        this._maxscriptClientPool = maxscriptClientPool;
        this._geometryCachePool = geometryCachePool;
        this._materialCachePool = materialCachePool;
        this._textureCachePool = textureCachePool;
        this._imageCachePool = imageCachePool;
    }

    public get SrcType(): string { return MeshBinding.SrcType }
    public get DstType(): string { return MeshBinding.DstType }

    public async Create(session: Session): Promise<ISceneObjectBinding>
    {
        let maxscript: IMaxscriptClient = await this._maxscriptClientPool.Get(session);
        let geometryCache = await this._geometryCachePool.Get(session);
        let materialCache = await this._materialCachePool.Get(session);
        let textureCache = await this._textureCachePool.Get(session);
        let imageCache = await this._imageCachePool.Get(session);
        return new MeshBinding(maxscript, geometryCache, materialCache, textureCache, imageCache, session.workspaceRef);
    }
}
