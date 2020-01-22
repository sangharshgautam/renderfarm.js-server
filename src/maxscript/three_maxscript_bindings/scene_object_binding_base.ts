import { ISceneObjectBinding, IMaxscriptClient, IGeometryCache, IMaterialCache } from "../../interfaces";
import { Workspace } from "../../database/model/workspace";

export abstract class SceneObjectBindingBase implements ISceneObjectBinding {
    protected _maxscriptClient: IMaxscriptClient;
    protected _geometryCache: IGeometryCache;
    protected _materialCache: IMaterialCache;
    protected _workspace: Workspace;

    protected _objectJson: any;

    protected _maxName: string;
    protected _maxParentName: string;

    public constructor(
        maxscriptClient: IMaxscriptClient,
        geometryCache?: IGeometryCache,
        materialCache?: IMaterialCache,
        workspace?: Workspace,
    ) {
        this._maxscriptClient = maxscriptClient;
        this._geometryCache = geometryCache;
        this._materialCache = materialCache;
        this._workspace = workspace;
    }

    public abstract Get(): Promise<any>;
    public abstract Post(objectJson: any, parent: any): Promise<any>;
    public abstract Put(objectJson: any): Promise<any>;
    public abstract Delete(): Promise<any>;

    protected getObjectName(obj: any): string {
        let parts = obj.uuid.split("-");

        if (obj.name) {
            let safeName = obj.name.replace(/\W/g, '');
            if (safeName) {
                return `${safeName}_${parts[0]}`;
            }
        }

        return `${obj.type}_${parts[0]}`;
    }
}
