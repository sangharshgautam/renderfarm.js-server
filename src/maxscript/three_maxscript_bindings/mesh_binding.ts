import { SceneObjectBindingBase } from "./scene_object_binding_base";
import { PostResult } from "../../interfaces";
import uuidv4 = require("uuid/v4");

export class MeshBinding extends SceneObjectBindingBase {
    public static SrcType: string = "Mesh";
    public static DstType: string = "EditableMesh";

    public async Get(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Post(objectJson: any, parentJson: any): Promise<PostResult> {
        console.log(" >> MeshBinding:\r\nobjectJson=", objectJson, "\r\nparentJson=", parentJson, "\r\n");

        let meshName = this.getObjectName(objectJson);
        let parentName = this.getObjectName(parentJson);

        let postResult = null;
        if (objectJson.userData && objectJson.userData.renderable === false) {
            console.log(` >> mesh binding, not renderable. Creating dummy`);
            await this._maxscriptClient.createDummy(meshName);
            await this._maxscriptClient.linkToParent(meshName, parentName);
            await this._maxscriptClient.setObjectMatrix(meshName, objectJson.matrix);
            postResult = {};

        } else if (objectJson.userData && objectJson.userData.xrefScene) {
            console.log(` >> mesh contains xrefScene definition: `, objectJson.userData.xrefScene);
            await this._maxscriptClient.xrefScene(objectJson.userData.xrefScene.filename, this._workspace, meshName);
            await this._maxscriptClient.linkToParent(meshName, parentName);
            await this._maxscriptClient.setObjectMatrix(meshName, objectJson.matrix);
            postResult = {};

        } else {
            let geometry = this._geometryCache.Geometries[objectJson.geometry];
            let material = Array.isArray(objectJson.material)
                ? objectJson.material.map(m => this._materialCache.Materials[m])
                : this._materialCache.Materials[objectJson.material];

            if (material) {
                console.log(` >> MeshBinding resolved material: `, material.ThreeJson);
            }

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

            let objectMaxName = null; // this object will be generated from userData.objectJson
            if (objectJson.userData && objectJson.userData.objectJson && objectJson.userData.objectJson.type) {
                objectMaxName = this.getObjectName(objectJson.userData.objectJson);
                console.log(` >> object will be created by objectJson: `, objectJson.userData.objectJson);
                await this._maxscriptClient.createObject(meshName, objectMaxName, objectJson.userData.objectJson);
            } else {
                postResult = await geometry.Post(objectJson.uuid, meshName);
            }
            await this._maxscriptClient.linkToParent(meshName, parentName);
            await this._maxscriptClient.setObjectMatrix(meshName, objectJson.matrix);

            console.log(` >> mesh binding, considering material`);
            if (material && material.ThreeJson && material.ThreeJson.name) {
                if (objectJson.userData && objectJson.userData.materialJson) {
                    //const textureVars = {};

                    //if (material.ThreeJson.map) {
                    //    const textureBinding = this._textureCache.Textures[material.ThreeJson.map];
                    //    const imageBinding = this._imageCache.Images[textureBinding.ThreeJson.image];
                    //    if (textureBinding && imageBinding) {
                    //        console.log(` >> mesh binding, material.map texture: `, material.ThreeJson.map, " , texture.image: ", textureBinding.ThreeJson.image);
                    //        const res1 = await imageBinding.Post();
                    //        await textureBinding.Post(res1.path, "diffuseTexture");
                    //        textureVars["map"] = "diffuseTexture";
                    //    } else {
                    //        console.log(`  WARN | mesh binding, material.map image not found in ImageCache: `, material.ThreeJson.map);
                    //    }
                    //}

                    objectJson.userData.materialJson["$"] = material.ThreeJson;

                    let materialName = material.ThreeJson.name;
                    console.log(` >> material will be cloned and assigned: `, materialName);
                    await this._maxscriptClient.assignMaterial(objectMaxName || meshName, materialName, objectJson.userData.materialJson);
                } else {
                    let materialName = material.ThreeJson.name;
                    console.log(` >> material will be assigned: `, materialName);
                    await this._maxscriptClient.assignMaterial(objectMaxName || meshName, materialName);
                }
            }

            if (Array.isArray(material)) {
                let materialNames = material.map(m => m.ThreeJson.name);
                console.log(` >> assign multiSubMaterial: `, materialNames);
                await this._maxscriptClient.assignMultiSubMaterial(meshName, materialNames);
            }
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
