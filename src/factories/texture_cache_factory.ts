import { injectable } from "inversify";
import { ITextureCache, IFactory } from "../interfaces";
import { Session } from "../database/model/session";
import { TextureCache } from "../maxscript/texture_cache";

@injectable()
export class TextureCacheFactory implements IFactory<ITextureCache> {
    public async Create(session: Session): Promise<ITextureCache> {
        return new TextureCache();
    }
}
