import { IDbEntity } from "./base/IDbEntity";
import { isArray } from "util";
import { Worker } from "./worker";

export class Job extends IDbEntity {
    public guid: string;
    public apiKey: string;

    public cameraJson: any;
    public bakeMeshUuid: string;

    public renderWidth: number;
    public renderHeight: number;
    public alpha: boolean;
    public renderSettings: any;

    public createdAt: Date;
    public updatedAt: Date;
    public closedAt: Date;
    public workerGuid: string;
    public state: string;
    public closed: boolean;
    public canceled: boolean;
    public failed: boolean;
    public error: string;
    public urls: string[];

    public workerRef: Worker;

    constructor(obj: any) {
        super();
        if (obj) {
            this.parse(obj);
        } else {
            this.urls = [];
        }
    }

    public parse(obj: any) {
        this.guid       = obj.guid;
        this.apiKey     = obj.apiKey;

        this.cameraJson   = obj.cameraJson;
        this.bakeMeshUuid = obj.bakeMeshUuid;

        this.renderWidth    = obj.renderWidth;
        this.renderHeight   = obj.renderHeight;
        this.alpha          = obj.alpha;
        this.renderSettings = obj.renderSettings;

        this.createdAt  = obj.createdAt ? new Date(obj.createdAt) : undefined;
        this.updatedAt  = obj.updatedAt ? new Date(obj.updatedAt) : undefined;
        this.closedAt   = obj.closedAt ? new Date(obj.closedAt) : undefined;
        this.workerGuid = obj.workerGuid;
        this.state      = obj.state;
        this.closed     = obj.closed;
        this.canceled   = obj.canceled;
        this.failed     = obj.failed;
        this.error      = obj.error;
        this.urls       = isArray(obj.urls) ? obj.urls : [];
    }

    public toJSON() {
        let result: any = {
            guid:       this.guid,
            apiKey:     this.apiKey,

            cameraJson:   this.cameraJson,
            bakeMeshUuid: this.bakeMeshUuid,

            renderWidth:    this.renderWidth,
            renderHeight:   this.renderHeight,
            alpha:          this.alpha,
            renderSettings: this.renderSettings,

            createdAt:  this.createdAt,
            updatedAt:  this.updatedAt,
            closedAt:   this.closedAt,
            workerGuid: this.workerGuid,
            state:      this.state,
            closed:     this.closed,
            canceled:   this.canceled,
            failed:     this.failed,
            error:      this.error,
            urls:       this.urls,
        };

        return this.dropNulls(result);
    }

    public get filter(): any {
        return {
            guid:       this.guid
        }
    }
}
