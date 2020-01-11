"use strict";

import * as express from "express";
import * as bodyParser from "body-parser";
import { injectable, multiInject, inject } from "inversify";
import { IApp, IEndpoint, ISettings, IMixpanel } from "./interfaces";
import { TYPES } from "./types";

@injectable()
class App implements IApp {

    private _settings: ISettings;
    private _express: express.Application;
    private _mixpanel: IMixpanel;

    constructor(@inject(TYPES.ISettings) settings: ISettings,
                @inject(TYPES.IMixpanel) mixpanel: IMixpanel,
                @multiInject(TYPES.IEndpoint) endpoints: IEndpoint[]
    ) {
        this._settings = settings;
        this._express = express();
        this._mixpanel = mixpanel;

        this.config();
        this.bindEndpoints(endpoints);
    }

    get express(): express.Application {
        return this._express;
    }

    private config(): void{

        // to support JSON-encoded bodies
        this._express.use(express.json({
            limit: '50mb'
        }));

        // to support URL-encoded bodies
        this._express.use(bodyParser.urlencoded({
            extended: true,
            limit: '50mb'
        }));
        
        this._express.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Session-Guid");
            res.header('Content-Type', 'application/json');
            res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
            next();
        });

        let self: App = this;
        this._express.use(function(req, res, next) {
            self._mixpanel.trackRequest(req, res);
            next();
        });
    }

    private bindEndpoints(endpoints: IEndpoint[]) {
        // report server status
        this._express.get('/', function (this: App, req, res) {
            console.log(`GET on /`);
            res.end(JSON.stringify({ ok: true, type: "version", data: { env: this._settings.env, version: this._settings.version } }));
        }.bind(this));

        this._express.get('/favicon.ico', function (this: App, req, res) {
            console.log(`GET on /favicon.ico`);

            let mimeType = "image/x-icon";

            const fs = require('fs');
            fs.readFile("favicon.ico", function(err, content) {
                if (err) {
                    console.error(err);
                    res.status(404);
                    res.end();
                } else {
                    res.writeHead(200, { 
                        'Content-Type': mimeType, 
                        'x-timestamp': Date.now(), 
                        'x-sent': true 
                    });
                    res.end(content);
                }
            });
        }.bind(this));

        for (let endp of endpoints) {
            endp.bind(this._express);
        }
    }
}

export { App };
