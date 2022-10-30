let mineflayer = require('mineflayer');
let vec3 = require('vec3');
let ENUM = require('./enum.json');

/**
 * 
 * @param {mineflayer.Bot} bot 
 * @param {mineflayer.BotOptions} options 
 */
module.exports = (bot, options) => {
    let start = false;
    let miningPos = vec3(-2412, 87, -1814);
    let blockPos = vec3(-2413, 87, -1820);
    let mineDistance = 5;

    bot.chatCommands.addCommand({
        command: 'mine',
        description: "Mine in a straight line",
        args: [{
            arg: "status",
            description: "Toggle status mining (eg: start/stop)"
        }],
        code: (_, status) => {

            start = ENUM.STATUS[status] ?? false;
            if (start)
                mine();
        }
    });

    async function mine() {
        await bot.lookAt(blockPos);
        try {
            let block = bot.blockAtCursor(mineDistance);
            if (block) {
                let harvestTool = bot.pathfinder.bestHarvestTool(block);
                if (harvestTool != bot.heldItem) {
                    bot.equip(harvestTool);
                }
                await bot.dig(block, true, 'raycast');
            }
        } catch (err) {
            bot.logger.log(err);
        }
        if (start)
            setTimeout(mine);
    }
};