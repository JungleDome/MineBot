import BotLoginInfo from "./model/botLoginInfo";
import Session, { SessionType } from "./model/session";



export class StatSession {
    public dbSession: Session = new Session()
    public timerId: NodeJS.Timer
    public updateInterval: number = 1000
    public get id(): string {
        return this.dbSession.id
    }


    public constructor(type: SessionType, botId: string = null, updateInterval: number = 1000) {
        this.dbSession.type = type
        if (botId) {
            this.dbSession.bot = new BotLoginInfo()
            this.dbSession.bot.id = botId
        }
        this.updateInterval = updateInterval
    }

    public async startSession() {
        this.dbSession = await this.dbSession.save();
        this.timerId = setInterval(async () => {
            this.dbSession.duration += this.updateInterval
            this.dbSession = await this.dbSession.save();
        }, this.updateInterval)
    }

    public stopSession() {
        clearInterval(this.timerId)
    }
}

export class Stats {
    private static _session: StatSession[] = []

    static startWebSession() {
        if (this._session.find(x => x.dbSession?.type == SessionType.WEB))
            return console.warn('A web session has already started, ignoring this call instead...')

        let webSession = new StatSession(SessionType.WEB)
        webSession.startSession()
        this._session.push(webSession)
        return webSession
    }

    static stopWebSession() {
        let webSessionIndex = this._session.findIndex(x => x.dbSession?.type == SessionType.WEB)
        if (webSessionIndex == -1)
            return
        this._session[webSessionIndex].stopSession()
        this._session.splice(webSessionIndex, 1)
    }

    static getWebSession() {
        let webSessionIndex = this._session.findIndex(x => x.dbSession?.type == SessionType.WEB)
        if (webSessionIndex == -1)
            return null
        return this._session[webSessionIndex]
    }

    static startBotSession(botId: string) {
        let botSession = new StatSession(SessionType.BOT, botId)
        let botSessionIndex = this._session.findIndex(x => x.dbSession?.type == SessionType.BOT && x.dbSession?.bot?.id == botId)
        if (botSessionIndex != -1)
            return console.warn('A bot session has already started, ignoring this call instead...')

        botSession.startSession()
        this._session.push(botSession)
    }

    static stopBotSession(botId: string) {
        let botSessionIndex = this._session.findIndex(x => x.dbSession?.type == SessionType.BOT && x.dbSession?.bot?.id == botId)
        if (botSessionIndex == -1)
            return
        this._session[botSessionIndex].stopSession()
        this._session.splice(botSessionIndex, 1)
    }

    static getBotSession(botId: string) {
        let botSessionIndex = this._session.findIndex(x => x.dbSession?.type == SessionType.BOT && x.dbSession?.bot?.id == botId)
        if (botSessionIndex == -1)
            return null
        return this._session[botSessionIndex]
    }
};