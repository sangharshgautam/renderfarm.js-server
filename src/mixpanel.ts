"use strict";

import { injectable, inject } from "inversify";
import { ISettings, IMixpanel } from "./interfaces";
import { TYPES } from "./types";

@injectable()
export class Mixpanel implements IMixpanel {
    private _settings: ISettings;
    private _mixpanel: any;

    constructor(@inject(TYPES.ISettings) settings: ISettings,
    ) {
        this._settings = settings;

        if (this._settings.current.mixpanelToken) {
            this._mixpanel = require('mixpanel').init(this._settings.current.mixpanelToken);
        } else {
            this._mixpanel = null;
        }
    }

    public trackRequest(req: any, res: any): void {
        if (this._mixpanel) {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            let url = req.url.replace(/\w{8}\-\w{4}\-\w{4}\-\w{4}\-\w{12}/g, ":guid");

            if (url !== '/v1/session/:guid' && !url.startsWith('/v1/session')) {
                return;
            }

            this._mixpanel.track('request', {
                ip: ip,
                method: req.method,
                url: url,
                raw_url: req.url,
                query: req.query,
                params: req.params,
                ip_addr: ip,
            });
        }
    }
}
