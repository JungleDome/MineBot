let mineflayer = require('mineflayer');

/**
 * 
 * @param {mineflayer.Bot} bot 
 * @param {mineflayer.BotOptions} options 
 */
module.exports = (bot, options) => {
    bot.chatCommands.addCommand({
        command: 'reload',
        description: "Reload all plugin",
        code: async () => { await bot.pluginManager.reload(); }
    });

    bot.chatCommands.addCommand({
        command: 'say',
        description: "Say the text given",
        args: [
            { arg: 'message', isRest: true }
        ],
        code: (_, ...message) => {
            bot.chat(message.join(' '));
        }
    });
};