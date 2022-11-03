const mineflayer = require('mineflayer');
const pluginManager = require('mineflayer-plugin-manager');
const pathfinder = require('mineflayer-pathfinder');
const chatCommands = require("mineflayer-chat-commands");
const autoAuth = require("mineflayer-auto-auth");
const gui = require("mineflayer-gui");
const { v4: uuidv4 } = require('uuid');
const config = require('./config.json');
const Logger = require('./logger');
const WorkerThread = require('node:worker_threads');
const path = require('node:path');
const { get } = require('node:http');

/** @type BotSpawnerBot */
let bot;

WorkerThread.parentPort.on('message', (message) => {
    switch (message.event) {
        case "create": {
            if (bot != null) {
                bot.bot.logger.error("Failed to create bot.");
                return;
            }
            bot = new BotSpawnerBot(message.payload.serverInfo, message.payload.botInfo);
            bot.createBot();
            bot.bot.once('spawn', () => {
                WorkerThread.parentPort.postMessage({
                    event: 'botCreated',
                    payload: {
                        id: bot.id,
                        status: bot.status
                    }
                });
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
                    chatHistory: bot.chatHistory,
                    logHistory: bot.bot ? bot.bot.logger.logHistory : []
                }
            });
            break;
        }
    }
});

WorkerThread.parentPort.postMessage({ event: 'ready' });

class BotSpawnerBot {

    id = uuidv4();
    serverInfo = null;
    botInfo = null;
    chatHistory = [];
    /** @type {import('.').Bot} */
    bot = null;
    status = null;
    STATUS = [
        'Normal',
        'Kicked',
        'End',
        'Error'
    ];
    logger = new Logger();
    isRestarting = false;
    isQuiting = false;
    REJOIN_DELAY = config['rejoinDelay'];
    CHATHISTORY_COUNT = config['retainTextHistoryLines'];

    constructor(serverInfo, botInfo) {
        this.serverInfo = serverInfo;
        this.botInfo = botInfo;
    }

    createBot() {
        this.bot = mineflayer.createBot({
            host: this.serverInfo.host,
            port: this.serverInfo.port,
            username: this.botInfo.username,
            pluginManager: {
                pluginDir: './src/plugins',
            },
            AutoAuth: {
                password: this.botInfo.offlinePassword,
                logging: true
            },
            autoTasker: {
                taskId: this.serverInfo.host
            },
            version: this.serverInfo.version
        });

        this.bot.loadPlugin(pathfinder.pathfinder);
        this.bot.loadPlugin(autoAuth);
        this.bot.loadPlugin(gui.plugin);
        this.registerBotVital();
        this.registerBotChatLog();
        this.bot.logger = this.logger;
        this.bot.on("chatCommands:ready", () => {
            this.bot.chatCommands.configs.allowBotChat = false;
            this.bot.chatCommands.configs.prefix = '';
            this.bot.chatCommands.configs.whitelist = ['CONSOLE'];
        });
        this.bot.loadPlugin(chatCommands);
        this.bot.loadPlugin(pluginManager.plugin);
    }

    commandBot(command) {
        this.bot.logger.log(`Received command: ${command}`);
        try {
            this.bot.chatCommands.runCommand("CONSOLE", command);
        } catch (err) {
            this.bot.logger.error(err);
        }
    }

    registerBotVital() {
        this.bot.on('login', () => {
            this.status = this.STATUS[0];
        });

        this.bot.on('kicked', (message) => {
            this.status = this.STATUS[1];
        });

        this.bot.on('end', (message) => {
            this.status = this.STATUS[2];
            this.rejoinBot();
        });

        this.bot.on('error', (message) => {
            this.status = this.STATUS[3];
        });
    }

    registerBotChatLog() {
        this.bot.on('message', (jsonMsg, position, senderUUID) => {
            if (position == 'game_info')
                return;

            this.chatHistory.push({ timestamp: Date.now(), message: jsonMsg.toString() });
            while (this.chatHistory.length > this.CHATHISTORY_COUNT) {
                this.chatHistory.shift();
            }
        });
    }

    rejoinBot() {
        if (this.isQuiting)
            return;

        setTimeout(() => {
            this.createBot();
            this.isRestarting = false;
        }, this.isRestarting ? 1000 : this.REJOIN_DELAY);
    }

    restartBot() {
        this.isRestarting = true;
        this.bot.quit();
        this.bot.logger.log("Restarting bot...");
    }

    stopBot() {
        this.isQuiting = true;
        this.bot.quit();
        this.bot.logger.log("Stopping bot...");
        process.exit();
    }
};