import { SceneObjectBindingBase } from "./scene_object_binding_base";
import { PostResult } from "../../interfaces";

export class MeshBinding extends SceneObjectBindingBase {
    public static SrcType: string = "Mesh";
    public static DstType: string = "EditableMesh";

    public async Get(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Post(objectJson: any, parentJson: any): Promise<PostResult> {
        console.log(" >> MeshBinding:\r\nobjectJson=", objectJson, "\r\nparentJson=", parentJson, "\r\n");

        let geometry = this._geometryCache.Geometries[objectJson.geometry];
        let material = Array.isArray(objectJson.material)
                        ? objectJson.material.map(m => this._materialCache.Materials[m])
                        : this._materialCache.Materials[objectJson.material];
        console.log(` >> MeshBinding resolved material: `, material);

        if (material) { // TODO: Mesh may have many material slots
            console.log(" >> found material in cache: ", material.ThreeJson);
        }

        if (!geometry) {
            console.log(`   WARN | geometry not cached: ${objectJson.geometry}`);
            return Promise.resolve({});
        }

        if (!material) {
            console.log(`   WARN | material not cached: ${objectJson.material}`);
        }

        let meshName = this.getObjectName(objectJson);
        let parentName = this.getObjectName(parentJson);

        let postResult = await geometry.Post(objectJson.uuid, meshName);

        await this._maxscriptClient.linkToParent(meshName, parentName);
        await this._maxscriptClient.setObjectMatrix(meshName, objectJson.matrix);

        console.log(` >> mesh binding, considering material`);
        if (material && material.ThreeJson && material.ThreeJson.name) {
            let materialName = material.ThreeJson.name;
            console.log(` >> material will be assigned: `, materialName);
            await this._maxscriptClient.assignMaterial(meshName, materialName);
        }

        if (Array.isArray(material)) {
            let materialNames = material.map(m => m.ThreeJson.name);
            console.log(` >> TODO: assign multiSubMaterial: `, materialNames);
            await this._maxscriptClient.assignMultiSubMaterial(meshName, materialNames);
        }

        this._maxName = meshName;
        this._maxParentName = parentName;

        return postResult;
    }

    public async Put(objectJson: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Delete(): Promise<any> {
        throw new Error("Method not implemented.");
    }
}
