import { IImageBinding, PostResult, IMaxscriptClient } from "../../interfaces";
var mime = require('mime-types')

export class ImageBinding implements IImageBinding {
    private _maxscriptClient: IMaxscriptClient;
    private _imageJson: any;

    public constructor(
        maxscriptClient: IMaxscriptClient,
        imageJson: any,
    ) {
        this._maxscriptClient = maxscriptClient;
        this._imageJson = imageJson;
    }

    public get ThreeJson(): any {
        return this._imageJson;
    }

    public async Get(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async Post(): Promise<PostResult> {
        console.log(` >> image binding Post: `, this._imageJson);

        const downloadUrl = this._imageJson.downloadUrl;
        const mimeType = mime.lookup(this._imageJson.fileExt);

        let tempDir = `C:\\\\Temp`;
        const path = `${tempDir}\\\\${this._imageJson.uuid}.${this._imageJson.fileExt}`;

        console.log(` >> tell 3dsmax to download from ${downloadUrl} into ${path}`);
        await this._maxscriptClient.downloadFile(downloadUrl, path, mimeType);

        return Promise.resolve({
            path
        });
    }

    public async Put(imageJson: any): Promise<any> {
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
