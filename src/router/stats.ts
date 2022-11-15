import { Router, Response } from 'express'
import { Status } from '../botSpawner';
import { Stats } from '../stats';
import WebServer from '../webServer';

export default function (app: Router, context: WebServer) {
    function sendSuccess(res: Response, content: Object) {
        res.status(200).send(content);
    }

    function getMemoryUsage() {
        let memoryUsed = process.memoryUsage().heapTotal / 1024 / 1024;
        let threadsMemoryUsed = context.botSpawner.getThreadsMemoryUsage().reduce((total: number, value: any) => value.memoryUsage ? total + value.memoryUsage.heapTotal : total, 0) / 1024 / 1024;
        return memoryUsed + threadsMemoryUsed
    }

    function getCurrentUptime() {
        return Stats.getWebSession().dbSession.duration
    }

    function getCurrentBotCount() {
        let onlineBotCount = context.botSpawner.botThreads.length;
        return onlineBotCount
    }

    function getCurrentEndBotCount() {
        let endBotCount = context.botSpawner.botThreads.filter(x => x.status == Status.END).length;
        return endBotCount
    }

    app.get('/stats', async (req, res) => {
        //Trigger update for all bot status
        context.botSpawner.getAllBotInfo()

        //Get metrics
        let memoryUsed = getMemoryUsage()
        let currentUptime = getCurrentUptime()
        let botCount = getCurrentBotCount()
        let endedBotCount = getCurrentEndBotCount()

        sendSuccess(res, { uptime: currentUptime, memoryUsed: memoryUsed, botCount: botCount, endedBotCount: endedBotCount  });
    });

    return app;
};