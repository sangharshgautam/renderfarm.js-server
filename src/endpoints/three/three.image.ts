import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, ISettings, IFactory, IImageCache, ISessionPool, ISessionService, IImageBinding } from "../../interfaces";
import { TYPES } from "../../types";
import { Session } from "../../database/model/session";
import { isArray } from "util";
var mime = require('mime-types')

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
        express.get(`/v${this._settings.majorVersion}/three/image/:uuid.:ext`, async function (this: ThreeImageEndpoint, req, res) {
            console.log(`GET on ${req.path}`);

            let uuid = req.params.uuid;

            let imageCache = this._imageCachePool.FindOne(obj => {
                return Object.keys(obj.Images).indexOf(uuid) !== -1;
            });

            if (!imageCache) {
                res.status(404);
                res.end(JSON.stringify({ ok: false, message: "image cache not found", error: null }, null, 2));
                return;
            }

            let imageBinding = imageCache.Images[uuid];
            if (!imageBinding) {
                res.status(404);
                res.end(JSON.stringify({ ok: false, message: "image not found", error: null }, null, 2));
                return;
            }

            var regex = /^data:.+\/(.+);base64,(.*)$/;
            var matches = imageBinding.ThreeJson.url.match(regex);
            var ext = matches[1];
            var data = matches[2];
            var buffer = Buffer.from(data, 'base64');

            res.writeHead(200, {
                'Content-Type': mime.lookup('ext'),
                'Content-Disposition': `attachment; filename=${uuid}.${ext}`,
                'Content-Length': buffer.length
            });
            res.end(buffer);
        }.bind(this));

        express.post(`/v${this._settings.majorVersion}/three/image`, async function (this: ThreeImageEndpoint, req, res) {
            let sessionGuid = req.body.session_guid;
            console.log(`POST on ${req.path} with session: ${sessionGuid}`);

            // check that session is actually open
            let session: Session = await this._sessionService.GetSession(sessionGuid, false, true);
            if (!session) {
                res.status(404);
                res.end(JSON.stringify({ ok: false, message: "session expired", error: null }, null, 2));
                return;
            }

            // check that session has no active job, i.e. it is not being rendered
            if (session.workerRef && session.workerRef.jobRef) {
                res.status(403);
                res.end(JSON.stringify({ ok: false, message: "changes forbidden, session is being rendered", error: null }, null, 2));
                return;
            }

            let imageJson: any = req.body.json; // this is uncompressed json
            if (!imageJson) {
                res.status(400);
                res.end(JSON.stringify({ ok: false, message: "body missing .json", error: null }, null, 2));
                return;
            }

            if (!isArray(imageJson)) {
                imageJson = [ imageJson ];
            }

            let makeDownloadUrl = function(this: ThreeImageEndpoint, imageJson: any) {
                return `${this._settings.current.publicUrl}/v${this._settings.majorVersion}/three/image/${imageJson.uuid}.${imageJson.ext}`;
            }.bind(this);

            const downloadUrls = [];
            let imageCache = await this._imageCachePool.Get(session);
            var regex = /^data:.+\/(.+);base64,(.*)$/;

            for (let i of imageJson) {
                var matches = i.url.match(regex);
                i.ext = matches[1];
                let newImageBinding = await this._imageBindingFactory.Create(session, i);
                imageCache.Images[i.uuid] = newImageBinding;
                let downloadUrl = makeDownloadUrl(i);
                downloadUrls.push(downloadUrl);
            }
    
            res.status(201);
            res.end(JSON.stringify({ ok: true, type: "url", data: downloadUrls }));
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
