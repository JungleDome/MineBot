let mineflayer = require('mineflayer');
let pathfinder = require('mineflayer-pathfinder');

/**
 * 
 * @param {mineflayer.Bot} bot 
 * @param {mineflayer.BotOptions} options 
 */
module.exports = (bot, options) => {
    bot.chatCommands.addCommand({
        command: 'dropAll',
        description: "Drop all item in inventory",
        code: async () => {
            try {
                for await (let item of bot.inventory.items()) {
                    await bot.tossStack(item);
                    bot.logger.log(`tossed ${item.displayName}`);
                }
            } catch (err) {
                bot.logger.log(err);
            }
        }
    });

    bot.chatCommands.addCommand({
        command: 'equip',
        description: "Equip any armor in inventory (Wont do anything if already equipped)",
        code: async () => {
            try {
                for await (let item of bot.inventory.items()) {
                    if (item.name == 'diamond_helmet')
                        try {
                            await bot.equip(item, "head");
                        } catch (err) {
                            bot.logger.log(err);
                        }
                }
            } catch (err) {
                bot.logger.log(err);
            }
        }
    });

    bot.chatCommands.addCommand({
        command: 'goto',
        description: "Go to position",
        args: [
            { arg: 'posX' },
            { arg: 'poxY' },
            { arg: 'poxZ' }
        ],
        code: async (_, posX, posY, posZ) => {
            try {
                let goal = new pathfinder.goals.GoalBlock(posX, posY, posZ);
                await bot.pathfinder.goto(goal);
            } catch (err) {
                bot.logger.log(err);
            }
        }
    });

    bot.on('serverAuth', function () {
        bot.chatCommands.runCommand('CONSOLE', 'join Server SKY');
    });
};