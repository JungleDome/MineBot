import { QuickDB } from "quick.db";

export default class Database {
    private static _persistInterval: number = 5000
    private static _instance: QuickDB
    private static _lastUpdate: any = {
        uptime: new Date()
    }
    private static _cache: any
    private static _persistTimer: any

    public static get Instance() {
        return this._instance || (this._instance = new QuickDB({ filePath: "data.sqlite" }))
    }

    // public async setSession(sessionId, payload: any) {
    //     let newUptime = await this.getUptime() + seconds;
    //     return this._updateValue('uptime', newUptime);
    // }

    public static async getSession() {
        let res = await this._getValue('uptime');
        return res || 0;
    }

    public static async appendUptime(seconds: number) {
        let newUptime = await this.getUptime() + seconds;
        return this._updateValue('uptime', newUptime);
    }

    public static async getUptime() {
        let res = await this._getValue('uptime');
        return res || 0;
    }

    public static async appendBotUptime(username: string, serverUrl: string, seconds: number) {
        let botUptime = await this.getBotUptime();
        // let botServerUptime = botUptime.find(x => x.username == username && x.serverUrl == serverUrl);

        // if (!botServerUptime) {
        //     botUptime.push({ username: username, serverUrl: serverUrl, uptime: seconds })
        // } else {
        //     botServerUptime.uptime += seconds
        // }

        return this._updateValue('botUptime', botUptime);
    }

    public static async getBotUptime() {
        let res = await this._getValue('botUptime');
        return res || [];
    }

    //#region Inner Function
    private static _updateValue(prop: string, value: any, table: string = 'json') {
        this._cache[prop] = value;
        this._setPersistInterval(prop, value, table);
        return value;
    }

    private static async _updateValueAsync(prop: string, value: any, table: string = 'json') {
        return await Database.Instance.table(table).set(prop, value);
    }

    private static async _getValue(prop: string, table = 'json') {
        // if cache not expired, use cache
        // else get from db
        if (this._validateCache(prop)) {
            return this._cache[prop];
        }
        return await Database.Instance.table(table).get(prop);
    }

    private static _setPersistInterval(prop: string, value: any, table: string = 'json') {
        let hasLastUpdate = this._lastUpdate[prop] != undefined;
        let lastUpdateExceedInterval = hasLastUpdate && Date.now() - this._lastUpdate[prop] >= this._persistInterval;
        if (!hasLastUpdate || lastUpdateExceedInterval) {
            this._updateValueAsync(prop, value, table);
            this._lastUpdate[prop] = new Date();
            clearTimeout(this._persistTimer[prop]);
            delete this._persistTimer[prop];
            return;
        }

        clearTimeout(this._persistTimer[prop]);
        this._persistTimer[prop] = setTimeout(() => {
            this._updateValueAsync(prop, value, table);
            this._lastUpdate[prop] = new Date();
            delete this._persistTimer[prop];
        }, this._persistInterval);
    }

    private static _validateCache(prop: string) {
        return this._cache[prop] != undefined && this._lastUpdate[prop] != undefined && Date.now() - this._lastUpdate[prop] < this._persistInterval + 1000;
    }
    //#endregion
}