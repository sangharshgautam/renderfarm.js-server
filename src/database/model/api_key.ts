import { IDbEntity } from "./base/IDbEntity";

interface IWorkgroupPermissions {
    limitOpenSessions: number;
}

interface IWorkgroups {
    [name: string]: IWorkgroupPermissions
}

export class ApiKey extends IDbEntity {

    public apiKey: string;
    public userGuid: string;
    public workgroups: IWorkgroups;
    public lastSeen: Date;

    constructor(obj: any) {
        super();
        this.parse(obj);
    }

    public parse(obj: any) {
        this.apiKey   = obj.apiKey;
        this.userGuid = obj.userGuid;
        this.lastSeen = obj.lastSeen ? new Date(obj.lastSeen) : undefined;
        this.workgroups = obj.workgroups;
    }

    public toJSON() {
        return {
            apiKey:   this.apiKey,
            userGuid: this.userGuid,
            lastSeen: this.lastSeen,
            workgroups: this.workgroups,
        };
    }

    public get filter(): any {
        return {
            apiKey: this.apiKey
        }
    }
}
