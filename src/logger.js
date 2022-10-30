const config = require('./config.json');

module.exports = class Logger {
    logHistory = [];
    LOGHISTORY_COUNT = config['retainLogHistoryAmount'];

    appendLog(level, message) {
        this.logHistory.push({ level: level, timestamp: Date.now(), message: message.toString() });
        while (this.logHistory.length > this.LOGHISTORY_COUNT) {
            this.logHistory.shift();
        }
        console.log(`${Date.now().toLocaleString()} [${level}] > ${message}`);
    }

    log(message) {
        this.appendLog('INFO', message)
    }

    error(message) {
        this.appendLog('ERROR', message);
    }
};