import { IImageCache, IImageBinding } from "../interfaces";

export class ImageCache implements IImageCache {
    public constructor() {
        this.Images = {};
    }

    public Images: { 
        [uuid: string]: IImageBinding; 
    };
}
