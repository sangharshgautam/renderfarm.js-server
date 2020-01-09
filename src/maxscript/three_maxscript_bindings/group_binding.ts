import { SceneObjectBindingBase } from "./scene_object_binding_base";
import { PostResult } from "../../interfaces";

export class GroupBinding extends SceneObjectBindingBase {
    public static SrcType: string = "Group";
    public static DstType: string = "Dummy";

    public async Get(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Post(objectJson: any, parentJson: any): Promise<PostResult> {
        console.log(" >> GroupBinding:\r\nobjectJson=", objectJson, "\r\nparentJson=", parentJson, "\r\n");

        let objName = this.getObjectName(objectJson);
        let parentName = this.getObjectName(parentJson);

        await this._maxscriptClient.createDummy(objName);
        await this._maxscriptClient.linkToParent(objName, parentName);
        await this._maxscriptClient.setObjectMatrix(objName, objectJson.matrix);

        this._maxName = objName;
        this._maxParentName = parentName;

        let result: PostResult = {};
        return result;
    }

    public async Put(objectJson: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Delete(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
