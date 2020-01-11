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
            this.mixpanel = require('mixpanel').init(this._settings.current.mixpanelToken);
        } else {
            this.mixpanel = null;
        }
    }

    public trackRequest(req: any, res: any): void {
        if (this.mixpanel) {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            this.mixpanel.track('request', {
                ip: ip,
                method: req.method,
                url: req.url,
                query: req.query,
            });
        }
    }
}
