import { Router, Response } from 'express'
import WebServer from '../webServer';
import Session, { SessionType } from '../model/session';
import { DateTime } from 'luxon'

export default function (app: Router, context: WebServer) {
    function sendSuccess(res: Response, content: Object) {
        res.status(200).send(content);
    }

    async function getTotalMinecraftServerOnlineTime() {
        let allSession = await Session.findBy({
            type: SessionType.BOT
        })

        let totalSession = new Map<string, number>()
        for (let session of allSession) {
            let key = `${session.bot.serverHost}:${session.bot.serverPort}`
            totalSession.set(key, (totalSession.get(key) ?? 0) + session.duration)
        }

        return Array.from(totalSession, (item) => { return { server: item[0], onlineTime: item[1] } })
    }

    async function getTotalBotOnlineTime() {
        let allSession = await Session.findBy({
            type: SessionType.BOT
        })

        let totalSession = new Map<string, number>()
        for (let session of allSession) {
            let key = session.bot.username
            totalSession.set(key, (totalSession.get(key) ?? 0) + session.duration)
        }

        return Array.from(totalSession, (item) => { return { username: item[0], onlineTime: item[1] } })
    }

    async function getRecentBotOnlineTime() {
        let allSession = await Session.findByCreatedDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), null, {
            type: SessionType.BOT,
        })

        let recentSession = new Map<number, Map<string, number>>()
        for (let session of allSession) {
            let key = DateTime.fromJSDate(session.createdDate).startOf('day').toMillis()
            let value = recentSession.get(key) ?? new Map()
            recentSession.set(key, value.set(session.bot.username, (value.get(session.bot.username) ?? 0) + session.duration))
        }

        return Array.from(recentSession, (item) => { return { date: item[0], botsOnlineTime: Array.from(item[1], (botOnlineTime) => { return { username: botOnlineTime[0], onlineTime: botOnlineTime[1] } }) } })
    }

    app.get('/dashboard', async (req, res) => {
        //Get metrics
        let totalMinecraftServerOnlineTime = await getTotalMinecraftServerOnlineTime()
        let totalBotOnlineTime = await getTotalBotOnlineTime()
        let recentBotOnlineTime = await getRecentBotOnlineTime()

        sendSuccess(res, { totalMinecraftServerOnlineTime, totalBotOnlineTime, recentBotOnlineTime });
    });

    return app;
};