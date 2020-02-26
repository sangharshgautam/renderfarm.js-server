import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, IDatabase, ISettings, IFactory, IMaxscriptClient, IImageCache, ISessionPool, ISessionService, IImageBinding } from "../../interfaces";
import { TYPES } from "../../types";
import { isArray } from "util";
import { Session } from "../../database/model/session";

const LZString = require("lz-string");

@injectable()
class ThreeImageEndpoint implements IEndpoint {
    private _settings: ISettings;
    private _sessionService: ISessionService;
    private _imageBindingFactory: IFactory<IImageBinding>;
    private _imageCachePool: ISessionPool<IImageCache>;

    constructor(@inject(TYPES.ISettings) settings: ISettings,
                @inject(TYPES.ISessionService) sessionService: ISessionService,
                @inject(TYPES.IImageBindingFactory) imageBindingFactory: IFactory<IImageBinding>,
                @inject(TYPES.IImageCachePool) imageCachePool: ISessionPool<IImageCache>,
    ) {
        this._settings = settings;
        this._sessionService = sessionService;
        this._imageBindingFactory = imageBindingFactory;
        this._imageCachePool = imageCachePool;
    }

    bind(express: express.Application) {
        express.get(`/v${this._settings.majorVersion}/three/image/:uuid`, async function (this: ThreeImageEndpoint, req, res) {
            let sessionGuid = req.body.session;
            console.log(`GET on ${req.path} with session: ${sessionGuid}`);

            let uuid = req.params.uuid;
            console.log(`todo: // retrieve image ${uuid}`);

            let imageCache = this._imageCachePool.FindOne(obj => {
                return Object.keys(obj.Images).indexOf(uuid) !== -1;
            });

            let imageBinding = imageCache.Images[uuid];
            if (!imageBinding) {
                res.status(404);
                res.end(JSON.stringify({ ok: false, message: "image not found", error: null }, null, 2));
                return;
            }

            res.status(200);
            res.end(JSON.stringify(imageBinding.ThreeJson));
        }.bind(this));

        express.post(`/v${this._settings.majorVersion}/three/image`, async function (this: ThreeImageEndpoint, req, res) {
            let sessionGuid = req.body.session_guid;
            console.log(`POST on ${req.path} with session: ${sessionGuid}`);

            // check that session is actually open
            let session: Session = await this._sessionService.GetSession(sessionGuid, false, false);
            if (!session) {
                return;
            }

            // check that session has no active job, i.e. it is not being rendered
            if (session.workerRef && session.workerRef.jobRef) {
                res.status(403);
                res.end(JSON.stringify({ ok: false, message: "changes forbidden, session is being rendered", error: null }, null, 2));
                return;
            }

            let compressedJson = req.body.compressed_json; // this is to create scene or add new obejcts to scene
            if (!compressedJson) {
                res.status(400);
                res.end(JSON.stringify({ ok: false, message: "missing compressed_json", error: null }, null, 2));
                return;
            }

            let imageJsonText = LZString.decompressFromBase64(compressedJson);
            let imageJson: any = JSON.parse(imageJsonText);

            console.log(` >> received new image json: `, imageJson);

            let makeDownloadUrl = function(this: ThreeImageEndpoint, imageJson: any) {
                return `${this._settings.current.host}:${this._settings.current.port}/v${this._settings.majorVersion}/three/image/${imageJson.uuid}`;
            }.bind(this);

            let imageCache = await this._imageCachePool.Get(session);

            if (isArray(imageJson)) {
                let data = [];
                for (let i in imageJson) {
                    let newImageBinding = await this._imageBindingFactory.Create(session, imageJson[i]);
                    imageCache.Images[imageJson[i].uuid] = newImageBinding;
                    let downloadUrl = makeDownloadUrl(imageJson[i]);
                    data.push(downloadUrl);
                }

                res.status(201);
                res.end(JSON.stringify({ ok: true, type: "url", data: data }));
            } else {
                let newImageBinding = await this._imageBindingFactory.Create(session, imageJson);
                imageCache.Images[imageJson.uuid] = newImageBinding;
                let downloadUrl = makeDownloadUrl(imageJson);
    
                res.status(201);
                res.end(JSON.stringify({ ok: true, type: "url", data: [ downloadUrl ] }));
            }
        }.bind(this));

        express.put(`/v${this._settings.majorVersion}/three/image/:uuid`, async function (this: ThreeImageEndpoint, req, res) {
            let sessionGuid = req.body.session;
            console.log(`PUT on ${req.path} with session: ${sessionGuid}`);

            let uuid = req.params.uuid;
            console.log(`todo: // accept updated image ${uuid}`);

            res.status(200);
            res.end(JSON.stringify({}));
        }.bind(this));

        express.delete(`/v${this._settings.majorVersion}/three/image/:uuid`, async function (this: ThreeImageEndpoint, req, res) {
            let sessionGuid = req.body.session;
            console.log(`DELETE on ${req.path} with session: ${sessionGuid}`);

            let uuid = req.params.uuid;
            console.log(`todo: // delete image ${uuid}`);

            res.status(200);
            res.end(JSON.stringify({}));
        }.bind(this));
    }
}

export { ThreeImageEndpoint };
