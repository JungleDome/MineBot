let mineflayer = require('mineflayer');
let config = require('./config.json');

/**
 * 
 * @param {mineflayer.Bot} bot 
 * @param {mineflayer.BotOptions} options 
 */
module.exports = (bot, options) => {
    function processTaskCommand(task) {
        if (task.includes('delay ')) {
            let delay = parseInt(task.replace('delay ', ''));
            return new Promise((resolve) => setTimeout(() => resolve(), delay));
        }
        return null;
    }

    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    bot.on('serverAuth', debounce(async () => {
        bot.logger.log('Running auto tasker tasks...');
        let taskerConfig = config[options.autoTasker.taskId];
        if (!taskerConfig)
            return;

        let onJoinTaskList = taskerConfig['onJoinCommand'];
        if (!onJoinTaskList)
            return;

        for await (let task of onJoinTaskList) {
            bot.logger.log(`Running task: ${task}`);
            let customCommand = processTaskCommand(task);
            if (customCommand) {
                await customCommand;
            } else {
                bot.chatCommands.runCommand("CONSOLE", task);
            }
        }
        bot.logger.log('Auto tasker done.');
    }), 1000);
};