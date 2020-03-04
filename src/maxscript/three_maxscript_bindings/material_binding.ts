import { IMaterialBinding, IMaxscriptClient, PostResult } from "../../interfaces";
import { parseMaterialProperty } from "./material_binding.helper";

export class MaterialBinding implements IMaterialBinding {
    private _maxscriptClient: IMaxscriptClient;
    private _materialJson: any;
    private _maxMaterialName: string;

    public constructor(
        maxscriptClient: IMaxscriptClient,
        materialJson: any,
    ) {
        this._maxscriptClient = maxscriptClient;
        this._materialJson = materialJson;
    }

    public get ThreeJson(): any {
        return this._materialJson;
    }

    public async Get(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Post(materialJson: any): Promise<PostResult> {
        this._materialJson = materialJson;

        console.log(" >> MaterialBinding takes json, and sends it to remote maxscript: ", this._materialJson);

        let matName = this.getObjectName(this._materialJson);
        console.log(" >> MaterialBinding find matName: ", matName);

        const keys = Object.keys(this._materialJson.params);
        for (let key of keys) {
            const value = this._materialJson.params[key];
            const maxscriptValue = parseMaterialProperty(this._materialJson.type, key, value, this._materialJson["$"]);
            if (typeof maxscriptValue === "object") {
                console.log("   WARN | parseMaterialProperty returned error: " + maxscriptValue.message);
                delete this._materialJson.params[key];
            } else {
                this._materialJson.params[key] = maxscriptValue;
            }
        }

        delete this._materialJson["$"];

        await this._maxscriptClient.createMaterial(matName, this._materialJson.type, this._materialJson.params);

        return {
        };
    }

    public async Put(materialJson: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Delete(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    protected getObjectName(obj: any) {
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
