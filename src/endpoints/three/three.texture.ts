import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, IDatabase, ISettings, IFactory, IMaxscriptClient, ITextureCache, ISessionPool, ISessionService, ITextureBinding } from "../../interfaces";
import { TYPES } from "../../types";
import { isArray } from "util";
import { Session } from "../../database/model/session";

const LZString = require("lz-string");

@injectable()
class ThreeTextureEndpoint implements IEndpoint {
    private _settings: ISettings;
    private _sessionService: ISessionService;
    private _textureBindingFactory: IFactory<ITextureBinding>;
    private _textureCachePool: ISessionPool<ITextureCache>;

    constructor(@inject(TYPES.ISettings) settings: ISettings,
                @inject(TYPES.ISessionService) sessionService: ISessionService,
                @inject(TYPES.ITextureBindingFactory) textureBindingFactory: IFactory<ITextureBinding>,
                @inject(TYPES.ITextureCachePool) textureCachePool: ISessionPool<ITextureCache>,
    ) {
        this._settings = settings;
        this._sessionService = sessionService;
        this._textureBindingFactory = textureBindingFactory;
        this._textureCachePool = textureCachePool;
    }

    bind(express: express.Application) {
        express.get(`/v${this._settings.majorVersion}/three/texture/:uuid`, async function (this: ThreeTextureEndpoint, req, res) {
            let sessionGuid = req.body.session;
            console.log(`GET on ${req.path} with session: ${sessionGuid}`);

            let uuid = req.params.uuid;
            console.log(`todo: // retrieve texture ${uuid}`);

            let textureCache = this._textureCachePool.FindOne(obj => {
                return Object.keys(obj.Textures).indexOf(uuid) !== -1;
            });

            let textureBinding = textureCache.Textures[uuid];
            if (!textureBinding) {
                res.status(404);
                res.end(JSON.stringify({ ok: false, message: "texture not found", error: null }, null, 2));
                return;
            }

            res.status(200);
            res.end(JSON.stringify(textureBinding.ThreeJson));
        }.bind(this));

        express.post(`/v${this._settings.majorVersion}/three/texture`, async function (this: ThreeTextureEndpoint, req, res) {
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

            let textureJsonText = LZString.decompressFromBase64(compressedJson);
            let textureJson: any = JSON.parse(textureJsonText);

            console.log(` >> received new texture json: `, textureJson);

            let makeDownloadUrl = function(this: ThreeTextureEndpoint, textureJson: any) {
                return `${this._settings.current.host}:${this._settings.current.port}/v${this._settings.majorVersion}/three/texture/${textureJson.uuid}`;
            }.bind(this);

            let textureCache = await this._textureCachePool.Get(session);

            if (isArray(textureJson)) {
                let data = [];
                for (let i in textureJson) {
                    let newTextureBinding = await this._textureBindingFactory.Create(session, textureJson[i]);
                    textureCache.Textures[textureJson[i].uuid] = newTextureBinding;
                    let downloadUrl = makeDownloadUrl(textureJson[i]);
                    data.push(downloadUrl);
                }

                res.status(201);
                res.end(JSON.stringify({ ok: true, type: "url", data: data }));
            } else {
                let newTextureBinding = await this._textureBindingFactory.Create(session, textureJson);
                textureCache.Textures[textureJson.uuid] = newTextureBinding;
                let downloadUrl = makeDownloadUrl(textureJson);
    
                res.status(201);
                res.end(JSON.stringify({ ok: true, type: "url", data: [ downloadUrl ] }));
            }
        }.bind(this));

        express.put(`/v${this._settings.majorVersion}/three/texture/:uuid`, async function (this: ThreeTextureEndpoint, req, res) {
            let sessionGuid = req.body.session;
            console.log(`PUT on ${req.path} with session: ${sessionGuid}`);

            let uuid = req.params.uuid;
            console.log(`todo: // accept updated texture ${uuid}`);

            res.status(200);
            res.end(JSON.stringify({}));
        }.bind(this));

        express.delete(`/v${this._settings.majorVersion}/three/texture/:uuid`, async function (this: ThreeTextureEndpoint, req, res) {
            let sessionGuid = req.body.session;
            console.log(`DELETE on ${req.path} with session: ${sessionGuid}`);

            let uuid = req.params.uuid;
            console.log(`todo: // delete texture ${uuid}`);

            res.status(200);
            res.end(JSON.stringify({}));
        }.bind(this));
    }
}

export { ThreeTextureEndpoint };
