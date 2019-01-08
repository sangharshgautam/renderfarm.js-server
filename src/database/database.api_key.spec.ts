import "reflect-metadata";

import { ISettings, IDatabase } from "../interfaces";
import { Settings } from "../settings";
import { Database } from "./database";
import { ApiKey } from "./model/api_key";
import { isString } from "util";

describe("Database", function() {
    var settings: ISettings;
    var database: IDatabase;

    const existingApiKey: string = "0000-0001";
    const existingUserGuid: string = "00000000-0000-0000-0000-000000000001";

    beforeEach(async function() {
        settings = new Settings("test");
        database = new Database(settings);
        await database.connect();
    });

    afterEach(async function() {
        await database.disconnect();
    })

    it("checks existing api key", async function() {
        let result: ApiKey = await database.getApiKey(existingApiKey);

        expect(result).toBeTruthy();
        expect(result.apiKey).toBe(existingApiKey);
        expect(result.userGuid).toBe(existingUserGuid);
        expect(new Date().getTime() - result.lastSeen.getTime()).toBeLessThan(3000); // db time minus now is less than 3 seconds
    });

    it("checks not existing api key", async function() {
        let result: ApiKey;
        try {
            result = await database.getApiKey("not-existing");
        } catch (err) {
            expect(isString(err)).toBeTruthy();
        }
        expect(result).toBeUndefined();
    });

    it("rejects api key check on not connected database", async function() {
        await database.disconnect();

        try {
            await database.getApiKey(existingApiKey);
        } catch (err) {
            expect(err).toBe("database not connected");
            return;
        }

        fail();
    });
});
