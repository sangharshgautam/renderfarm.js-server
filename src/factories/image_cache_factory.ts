import { injectable } from "inversify";
import { IImageCache, IFactory } from "../interfaces";
import { Session } from "../database/model/session";
import { ImageCache } from "../maxscript/image_cache";

@injectable()
export class ImageCacheFactory implements IFactory<IImageCache> {
    public async Create(session: Session): Promise<IImageCache> {
        return new ImageCache();
    }
}
