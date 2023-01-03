import mineflayer from 'mineflayer'
import { plugin as pluginManager } from 'mineflayer-plugin-manager';
import { pathfinder } from 'mineflayer-pathfinder';
//@ts-ignore
import chatCommands from 'mineflayer-chat-commands'
//@ts-ignore
import autoAuth from 'mineflayer-auto-auth'
//@ts-ignore
import gui from 'mineflayer-gui'
import config from '../config.json'
import Logger from '../logger'
import process from 'node:process'
import BotLoginInfo from '../model/botLoginInfo';
import { Status } from '../botSpawner';
import { EventEmitter } from 'typeorm/platform/PlatformTools';

// const mineflayer = require('mineflayer');
// const pluginManager = require('mineflayer-plugin-manager');
// const pathfinder = require('mineflayer-pathfinder');
// const chatCommands = require("mineflayer-chat-commands");
// const autoAuth = require("mineflayer-auto-auth");
// const gui = require("mineflayer-gui");
// const { v4: uuidv4 } = require('uuid');
// const config = require('../config.json');
// const Logger = require('../logger');
// const WorkerThread = require('node:worker_threads');
// const path = require('node:path');
// const { get } = require('node:http');
// const process = require('process');

export default class BotThread extends EventEmitter {
    public loginInfo: BotLoginInfo;
    public bot: mineflayer.Bot
    public status: Status;
    public logger = new Logger(config.logHistoryLimit);
    public chatLogger = new Logger(config.chatHistoryLimit);
    public isRestarting = false;
    public isQuiting = false;
    public REJOIN_DELAY = config['rejoinDelay'];
    public get id(): string {
        return this.loginInfo.id
    }
    public botCreated: boolean = undefined;

    public constructor(loginInfo: BotLoginInfo) {
        super();
        this.loginInfo = loginInfo
    }

    public createBot() {
        this.bot = mineflayer.createBot({
            host: this.loginInfo.serverHost,
            port: this.loginInfo.serverPort,
            username: this.loginInfo.username,
            pluginManager: {
                pluginDir: './dist/bot/plugins',
            },
            //@ts-ignore
            AutoAuth: {
                password: this.loginInfo.password,
                logging: true
            },
            autoTasker: {
                taskId: this.loginInfo.serverHost
            },
            version: this.loginInfo.serverVersion
        });

        this.bot.loadPlugin(pathfinder);
        this.bot.loadPlugin(autoAuth);
        this.bot.loadPlugin(gui.plugin);
        this.registerCreateBotEvent();
        this.registerBotVital();
        this.registerBotChatLog();
        //@ts-ignore
        this.bot.logger = this.logger;
        //@ts-ignore
        this.bot.on("chatCommands:ready", () => {
            //@ts-ignore
            this.bot.chatCommands.configs.allowBotChat = false;
            //@ts-ignore
            this.bot.chatCommands.configs.prefix = '';
            //@ts-ignore
            this.bot.chatCommands.configs.whitelist = ['CONSOLE'];
        });
        this.bot.loadPlugin(chatCommands);
        this.bot.loadPlugin(pluginManager);
    }

    public commandBot(command: string) {
        this.logger.log(`Received command: ${command}`);
        try {
            //@ts-ignore
            this.bot.chatCommands.runCommand("CONSOLE", command);
        } catch (err: any) {
            this.logger.error(err);
        }
    }

    registerBotVital() {
        this.bot.on('spawn', () => {
            this.status = Status.NORMAL;
            this.emit('spawn')
        });

        this.bot.on('kicked', (message) => {
            this.status = Status.KICKED;
        });

        this.bot.on('end', (message) => {
            this.status = Status.END;
            this.emit('end')
            if (this.botCreated)
                this.rejoinBot();
        });

        this.bot.on('error', (message) => {
            this.status = Status.ERROR;
        });
    }

    registerBotChatLog() {
        this.bot.on('message', (jsonMsg, position) => {
            if (position == 'game_info')
                return;

            this.chatLogger.appendLog('CHAT', jsonMsg.toString())
        });
    }

    registerCreateBotEvent() {
        this.bot.once('spawn', () => {
            if (this.botCreated == undefined) {
                this.botCreated = true
                this.emit('createBotSuccessful')
                //@ts-ignore
                this.bot.logger.log('Joined server successfully.')
            }
        })

        this.bot.once('kicked', (reason) => {
            if (this.botCreated == undefined) {
                this.botCreated = false
                this.emit('createBotFailed', { errorMessage: reason })
            }
        })

        this.bot.once('end', (reason) => {
            if (this.botCreated == undefined) {
                this.botCreated = false
                this.emit('createBotFailed', { errorMessage: reason })
            }
        })
    }

    rejoinBot() {
        if (this.isQuiting)
            return;

        setTimeout(() => {
            this.logger.log('Rejoining bot...');
            this.createBot();
            this.isRestarting = false;
        }, this.isRestarting ? 1000 : this.REJOIN_DELAY);
    }

    restartBot() {
        this.isRestarting = true;
        if (this.status == Status.END) {
            this.rejoinBot()
        } else {
            this.bot.quit();
        }
        this.logger.log("Restarting bot...");
    }

    stopBot() {
        this.isQuiting = true;
        this.bot.quit();
        this.logger.log("Stopping bot...");
        this.logger.log("Exitting process in 10 seconds...");
        setTimeout(() => {
            this.logger.log("Process exiting...");
            process.exit();
        }, 10 * 1000)
    }
};