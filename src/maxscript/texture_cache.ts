import { ITextureCache, ITextureBinding } from "../interfaces";

export class TextureCache implements ITextureCache {
    public constructor() {
        this.Textures = {};
    }

    public Textures: { 
        [uuid: string]: ITextureBinding; 
    };
}
