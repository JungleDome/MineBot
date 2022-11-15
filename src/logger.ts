export class LogItem {
    public level: string;
    public timestamp: Date;
    public message: string;

    public constructor(init?: Partial<LogItem>) {
        Object.assign(this, init);
    }

    private getDate() {
        let date = this.timestamp.toLocaleString('en-gb', { year: 'numeric', month: '2-digit', day: '2-digit' });
        let time = this.timestamp.toLocaleString('en-gb', { hour: '2-digit', hour12: false, minute: '2-digit', second: '2-digit' });
        return `${date} ${time}`;
    }

    public getDisplayString() {
        return `${this.getDate()} [${this.level}] > ${this.message}`
    }
}

export default class Logger {
    public logHistory: LogItem[] = [];
    public HISTORY_LIMIT = -1;

    public constructor(logHistoryLimit: number) {
        this.HISTORY_LIMIT = logHistoryLimit
    }

    public appendLog(level: string, message: string) {
        let logItem = new LogItem({ level: level, timestamp: new Date(), message: message.toString() })
        this.logHistory.push(logItem);
        this.purgeOldHistory()
        console.log(logItem.getDisplayString());
    }

    public log(message: string) {
        this.appendLog('INFO', message);
    }

    public error(message: string) {
        this.appendLog('ERROR', message);
    }

    private purgeOldHistory() {
        if (this.HISTORY_LIMIT == -1)
            return

        while (this.logHistory.length > this.HISTORY_LIMIT) {
            this.logHistory.shift();
        }
    }
};