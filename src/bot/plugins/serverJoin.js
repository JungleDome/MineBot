let mineflayer = require('mineflayer');
const registry = require('prismarine-registry')('1.18.2');
const ChatMessage = require("prismarine-chat")(registry);
const util = require('util');
let ENUM = require('./enum.json');

/**
 * 
 * @param {mineflayer.Bot} bot 
 * @param {mineflayer.BotOptions} options 
 */
module.exports = (bot, options) => {
    function createOptions(hotbar = false) {
        return {
            include: true,
            hotbar: hotbar,
            window: bot.currentWindow ? bot.currentWindow : bot.inventory
        };
    }

    bot.on('spawn', () => {
        //bot.chat('/login ' + options.AutoAuth.password);
    });

    bot.chatCommands.addCommand({
        command: 'join',
        description: "Join a server using server selector",
        args: [
            { arg: 'selectorDisplayName' },
            { arg: 'serverItemDisplayName' }
        ],
        code: async (_, selectorDisplayName, serverItemDisplayName) => {
            if (bot.currentWindow) {
                bot.closeWindow(bot.currentWindow)
                bot.logger.log('Has current window')
            }
            await bot.gui.clickItem(createOptions(true), { name: new ChatMessage(selectorDisplayName) }, { name: new ChatMessage(serverItemDisplayName) });
            //await bot.gui.clickItem(createOptions(), );
        }
    });

    bot.chatCommands.addCommand({
        command: 'select',
        description: "Join a server using server selector",
        args: [
            { arg: 'selectorDisplayName' },
        ],
        code: async (_, selectorDisplayName) => {
            let a = await bot.gui.getItem(createOptions(), { name: new ChatMessage(selectorDisplayName) });
            bot.logger.log(JSON.stringify(a));
            await bot.gui.clickItem(createOptions(), { name: new ChatMessage(selectorDisplayName) });
        }
    });

    bot.chatCommands.addCommand({
        command: 'closeWindow',
        description: "Close current window",
        code: async () => {
            if (bot.currentWindow) {
                bot.closeWindow(bot.currentWindow);
            }
        }
    });

    bot.chatCommands.addCommand({
        command: 'debug',
        description: "Debug bot properties",
        args: [
            { arg: 'propertyName' },
        ],
        code: async (_, propertyName) => {
            try {
                bot.logger.log(util.inspect(bot[propertyName]));
            } catch (err) {
                bot.logger.log(err);
            }
        }
    });

    bot.chatCommands.addCommand({
        command: 'rejoinGameServer',
        description: "Rejoin server when redirect back to hub due to server restart or error.",
        args: [{
            arg: "status",
            description: "Toggle status (eg: on/off)"
        }],
        code: (_, status) => {

            let start = ENUM.STATUS[status] ?? false;
            if (start) {
                bot.on('spawn', dimensionChangeListener);
            } else {
                bot.off('spawn', dimensionChangeListener);
            }

        }
    });

    let dimensionChangeListener = () => {
        bot.logger.log(`spawn in : ${bot.game.dimension}`);

        let joinGameServer = () => {
            if (!bot.tablist.header.toString().includes('SansSMP')) {
                bot.chatCommands.runCommand("CONSOLE", "join \"Server Selector\" SANS");
            } else {
                bot.logger.log(`bot joined game server, stop checking for lobby.`);
                clearInterval(timeoutChecker);
            }
        }

        let timeoutChecker = setInterval(joinGameServer, 1000 * 30);
    };
};
