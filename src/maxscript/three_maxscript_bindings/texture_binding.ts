import { PostResult, ITextureBinding, IMaxscriptClient } from "../../interfaces";

export class TextureBinding implements ITextureBinding {
    private _maxscriptClient: IMaxscriptClient;
    private _textureJson: any;

    public constructor(
        maxscriptClient: IMaxscriptClient,
        textureJson: any,
    ) {
        this._maxscriptClient = maxscriptClient;
        this._textureJson = textureJson;
    }

    public get ThreeJson(): any {
        return this._textureJson;
    }

    public async Get(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Post(filepath: string, varName: string): Promise<PostResult> {
        console.log(" >> TextureBinding takes json, and sends it to remote maxscript: ", this._textureJson);

        const maxName = this.getObjectName(this._textureJson);
        await this._maxscriptClient.createBitmapTexture(maxName, this._textureJson, filepath, varName);

        return Promise.resolve({
        });
    }

    public async Put(objectJson: any, filepath: string, varName: string): Promise<any> {
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
