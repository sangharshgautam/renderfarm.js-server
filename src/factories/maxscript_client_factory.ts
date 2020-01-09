import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { IMaxscriptClient, IFactory, ISettings } from "../interfaces";
import { MaxscriptClient } from "../maxscript/maxscript_client";
import { Session } from "../database/model/session";

@injectable()
export class MaxscriptClientFactory implements IFactory<IMaxscriptClient> {
    private _settings: ISettings;

    constructor(
        @inject(TYPES.ISettings) settings: ISettings,
    ) {
        this._settings = settings;
    }

    public async Create(session: Session): Promise<IMaxscriptClient> {
        return new MaxscriptClient(this._settings);
    }
}
