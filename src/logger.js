const config = require('./config.json');

module.exports = class Logger {
    logHistory = [];
    LOGHISTORY_COUNT = config['retainLogHistoryAmount'];

    appendLog(level, message) {
        this.logHistory.push({ level: level, timestamp: Date.now(), message: message.toString() });
        while (this.logHistory.length > this.LOGHISTORY_COUNT) {
            this.logHistory.shift();
        }
        console.log(`${this.getDate()} [${level}] > ${message}`);
    }

    getDate() {
        let date = new Date().toLocaleString('en-gb', { year: 'numeric', month: '2-digit', day: '2-digit' });
        let time = new Date().toLocaleString('en-gb', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' });
        return `${date} ${time}`;
    }

    log(message) {
        this.appendLog('INFO', message);
    }

    error(message) {
        this.appendLog('ERROR', message);
    }
};