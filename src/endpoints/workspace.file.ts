import { injectable, inject } from "inversify";
import * as express from "express";
import { IEndpoint, ISettings, IDatabase } from "../interfaces";
import { TYPES } from "../types";

@injectable()
export class WorkspaceFileEndpoint implements IEndpoint {
    private _settings: ISettings;
    private _database: IDatabase;

    constructor(
        @inject(TYPES.ISettings) settings: ISettings,
        @inject(TYPES.IDatabase) database: IDatabase
    ) {
        this._settings = settings;
        this._database = database;
    }

    bind(express: express.Application) {
        express.get(`/v${this._settings.majorVersion}/workspace/:guid/file/*`, async function (this: WorkspaceFileEndpoint, req, res) {
            console.log(`GET on /workspace/${req.params.guid}/file/${req.params[0]}`);

            let workspaceGuid = req.params.guid;

            this._database.getWorkspace(workspaceGuid)
                .then(function(this: WorkspaceFileEndpoint, workspaceInfo){

                    if (!workspaceInfo) {
                        console.error(`  FAIL | workspace not found: ${workspaceGuid}`, workspaceInfo);
                        res.status(404);
                        res.end(JSON.stringify({ error: "workspace not found" }, null, 2));
                        return;
                    }

                    let parts = req.params[0].split("/");
                    console.log(` >> parts: `, parts);
                    if (parts.length === 0) {
                        res.status(404);
                        res.end(JSON.stringify({ error: "file not found" }, null, 2));
                        return;
                    }

                    let filename = parts.pop();

                    let mime = require('mime-types');
                    let mimeType = mime.lookup(filename);

                    let rootDir = `rfarm-api/api-keys/${workspaceInfo.apiKey}/workspaces/${workspaceInfo.guid}/` + parts.join("/");
                    console.log(` >> Looking up file ${filename} in folder ${rootDir}`);

                    let options = {
                        root: rootDir,
                        dotfiles: 'deny',
                        headers: {
                            'x-timestamp': Date.now(),
                            'x-sent': true,
                            'Content-type': mimeType
                        }
                    };

                    res.sendFile(filename, options, function (this: WorkspaceFileEndpoint, err) {
                        if (err) {
                            console.error(err);
                            res.status(404);
                            res.end();
                        } else {
                            console.log('Sent:', filename);
                        }
                    });

                }.bind(this))
                .catch(function(this: WorkspaceFileEndpoint, err){
                    console.error(`  FAIL | failed to get workspace: ${workspaceGuid}, \n`, err);
                    res.status(500);
                    res.end(JSON.stringify({ error: "failed to get workspace" }, null, 2));
                }.bind(this));

        }.bind(this));
    }
}
