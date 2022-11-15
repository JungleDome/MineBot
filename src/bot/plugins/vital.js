let mineflayer = require('mineflayer');

/**
 * 
 * @param {mineflayer.Bot} bot 
 * @param {mineflayer.BotOptions} options 
 */
module.exports = (bot, options) => {
    bot.on('kicked', (message) => {
        bot.logger.log(`[KICKED]: ${message}`);
    });

    bot.on('error', (message) => {
        bot.logger.log(`[ERROR]: ${message}`);
    });

    bot.on('end', (message) => {
        bot.logger.log(`[END]: ${message}`);
    });
};