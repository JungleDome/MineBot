import { Worker as WorkerThread } from 'node:worker_threads';
import path from 'node:path'
import { LogItem } from './logger';
import BotLoginInfo from './model/botLoginInfo';
import { Stats } from './stats';

// const WorkerThread = require('node:worker_threads').Worker;
// const path = require('node:path');
// const { setInterval, clearInterval } = require('node:timers');
// const { appendBotUptime } = require('./db');

export enum Status {
    'NORMAL',
    'KICKED',
    'END',
    'ERROR'
};

export class BotSpawnerItem {
    public loginInfo: BotLoginInfo;
    public status: Status;
    public thread: WorkerThread;
    public chatHistory: LogItem[] = [];
    public logHistory: LogItem[] = [];
    public memoryUsage: Object;
    public get id(): string {
        return this.loginInfo.id
    };

    public constructor(init?: Partial<BotSpawnerItem>) {
        Object.assign(this, init);
    }
}

export default class BotSpawner {
    public botThreads: BotSpawnerItem[] = [];

    public spawnBotThread(loginInfo: BotLoginInfo) {
        return new Promise((resolve, reject) => {


            let botThread = new WorkerThread(path.join(__dirname, 'bot', 'index.js'));

            botThread.on('error', (err) => {
                console.log(err);
            });

            botThread.on('message', (message) => {
                switch (message.event) {
                    case 'ready': {
                        botThread.postMessage({
                            event: 'create',
                            payload: {
                                loginInfo: loginInfo,
                            }
                        });
                        break;
                    }
                    case 'createBotSuccessful': {
                        let { status } = message.payload;
                        let item = new BotSpawnerItem({ loginInfo: loginInfo, status: status, thread: botThread });
                        this.botThreads.push(item);
                        resolve(null)
                        break;
                    }
                    case 'createBotFailed': {
                        console.log('create bot failed: spawner')
                        let { errorMessage } = message.payload;
                        reject(errorMessage)
                        break;
                    }
                    case 'getInfo': {
                        let { id, status, chatHistory, logHistory } = message.payload;
                        let botThread = this.getBot(id);
                        if (!botThread) return
                        botThread.status = status;
                        botThread.chatHistory = chatHistory;
                        botThread.logHistory = logHistory;
                        break;
                    }
                    case "getMemoryUsage": {
                        let { id, memoryUsage } = message.payload;
                        let botThread = this.getBot(id);
                        if (!botThread) return
                        botThread.memoryUsage = memoryUsage;
                        break;
                    }
                    case "uptime_start": {
                        console.log('starting session')
                        Stats.startBotSession(loginInfo.id)
                        break;
                    }
                    case "uptime_end": {
                        console.log('ending session')
                        Stats.stopBotSession(loginInfo.id)
                        break;
                    }
                }
            });
        })
    }

    public getBot(id: string) {
        return this.botThreads.find(x => x.id == id);
    }

    public getBotInfo(id: string) {
        let bot = this.getBot(id);
        if (!bot)
            //@ts-ignore
            return { status: '', chatHistory: [], logHistory: [] };

        bot.thread.postMessage({ event: 'getInfo' });
        return {
            status: bot.status,
            chatHistory: bot.chatHistory,
            logHistory: bot.logHistory
        };
    }

    public getAllBotInfo() {
        for (let botThread of this.botThreads) {
            botThread.thread.postMessage({ event: 'getInfo' });
        }
    }

    //#region Stats
    public getThreadsMemoryUsage() {
        let res: Object[] = [];
        for (let bot of this.botThreads) {
            bot.thread.postMessage({ event: 'getMemoryUsage' });
            res.push({
                memoryUsage: bot.memoryUsage
            });
        }
        return res;
    }
    //#endregion

    //#region API
    public async createBot(loginInfo: BotLoginInfo) {
        return await this.spawnBotThread(loginInfo);
    }

    public commandBot(botId: string, command: string): boolean {
        let bot = this.getBot(botId);
        if (!bot) return false

        bot.thread.postMessage({
            event: 'command',
            payload: {
                command: command
            }
        });

        return true
    }

    public restartBot(botId: string): boolean {
        let bot = this.getBot(botId);
        if (!bot) return false;

        bot.thread.postMessage({
            event: 'restart'
        });
        return true;
    }

    public stopBot(botId: string): boolean {
        let bot = this.getBot(botId);
        if (!bot) return false;

        bot.thread.postMessage({
            event: 'stop'
        });

        let botIndex = this.botThreads.findIndex(x => x.id == botId);
        this.botThreads.splice(botIndex, 1);
        return true;
    }
    //#endregion

};