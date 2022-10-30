const { v4: uuidv4 } = require('uuid');
const config = require('./config.json');
const WorkerThread = require('node:worker_threads').Worker;
const path = require('node:path');

module.exports = class BotSpawner {

    /** @type {import('.').BotSpawnerBot[]} */
    botThreads = [];
    CHATHISTORY_COUNT = config['retainTextHistoryLines'];

    spawnBotThread(serverInfo, botInfo) {
        /** @type WorkerThread */
        let botThread = new WorkerThread(path.join(__dirname, 'botThread.js'));

        botThread.on('error', (err) => {
            console.log(err);
        });

        botThread.on('message', (message) => {
            switch (message.event) {
                case 'ready': {
                    botThread.postMessage({
                        event: 'create',
                        payload: {
                            serverInfo: serverInfo,
                            botInfo: botInfo
                        }
                    });
                    break;
                }
                case 'botCreated': {
                    let id = message.payload.id;
                    let status = message.payload.status;
                    this.botThreads.push({ id: id, serverInfo: serverInfo, botInfo: botInfo, status: status, thread: botThread, chatHistory: [], logHistory: [] });
                    break;
                }
                case 'getInfo': {
                    let { id, status, chatHistory, logHistory } = message.payload;
                    let botThread = this.getBot(id);
                    botThread.status = status;
                    botThread.chatHistory = chatHistory;
                    botThread.logHistory = logHistory;
                    break;
                }
            }
        });
    }

    /**
     * 
     * @param {uuidv4} id 
     * @returns 
     */
    getBot(id) {
        return this.botThreads.find(x => x.id == id);
    }

    getBotInfo(id) {
        let bot = this.getBot(id);
        if (!bot)
            return { status: '', chatHistory: [], logHistory: [] };

        bot.thread.postMessage({ event: 'getInfo' });
        return {
            status: bot.status,
            chatHistory: bot.chatHistory,
            logHistory: bot.logHistory
        };
    }

    //#region API
    createBot(serverInfo, botInfo) {
        this.spawnBotThread(serverInfo, botInfo);
    }

    commandBot(botId, command) {
        let bot = this.getBot(botId);
        bot.thread.postMessage({
            event: 'command',
            payload: {
                command: command
            }
        });
    }

    restartBot(botId) {
        let bot = this.getBot(botId);
        bot.thread.postMessage({
            event: 'restart'
        });
    }

    stopBot(botId) {
        let bot = this.getBot(botId);
        bot.thread.postMessage({
            event: 'stop'
        });
    }
    //#endregion

};