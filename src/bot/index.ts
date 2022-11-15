import BotThread from "./botThread";
import WorkerThread from 'node:worker_threads'

let bot: BotThread;

WorkerThread.parentPort.on('message', (message) => {
    switch (message.event) {
        case "create": {
            if (bot != null) {
                bot.logger.error("Failed to create bot.");
                return;
            }
            bot = new BotThread(message.payload.loginInfo);
            bot.createBot();
            bot.on('end', () => {
                WorkerThread.parentPort.postMessage({
                    event: 'uptime_end',
                    payload: {}
                });
            });
            bot.on('spawn', () => {
                WorkerThread.parentPort.postMessage({
                    event: 'uptime_start',
                    payload: {}
                });
            });
            bot.on('createBotSuccessful', () => {
                WorkerThread.parentPort.postMessage({
                    event: 'createBotSuccessful',
                    payload: {
                        status: bot.status
                    }
                });
            });
            bot.on('createBotFailed', ({ errorMessage }) => {
                console.log('create bot failed : index')
                WorkerThread.parentPort.postMessage({
                    event: 'createBotFailed',
                    payload: {
                        errorMessage: errorMessage
                    }
                });
                process.exit(1)
            });
            break;
        }
        case "command": {
            bot.commandBot(message.payload.command);
            break;
        }
        case "restart": {
            bot.restartBot();
            break;
        }
        case "stop": {
            bot.stopBot();
            break;
        }
        case "getInfo": {
            WorkerThread.parentPort.postMessage({
                event: 'getInfo',
                payload: {
                    id: bot.id,
                    status: bot.status,
                    chatHistory: bot.chatLogger.logHistory,
                    logHistory: bot.logger.logHistory
                }
            });
            break;
        }
        case "getMemoryUsage": {
            WorkerThread.parentPort.postMessage({
                event: 'getMemoryUsage',
                payload: {
                    id: bot.id,
                    memoryUsage: process.memoryUsage()
                }
            });
            break;
        }
    }
});

WorkerThread.parentPort.postMessage({ event: 'ready' });