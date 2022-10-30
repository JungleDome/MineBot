import Mineflayer from "mineflayer"
import { Worker } from "node:worker_threads"

interface Bot extends Mineflayer.Bot {
    logger: Logger
}

interface Logger {
    appendLog(level: string, message: string): void
    log(message: string): void
    error(message: string): void
}

interface ServerInfo {
    host: string
    port: number
    cracked: boolean
}

interface BotInfo {
    username: string,
    offlinePassword: string
}

interface BotSpawnerBot {
    id: string
    serverInfo: ServerInfo
    botInfo: BotInfo
    bot: Bot
    chatHistory: TextHistory[]
    logHistory: LogHistory[]
    status: 'Normal' | 'Kicked' | 'End' | 'Error'
    thread: Worker
}

interface TextHistory {
    timestamp: number
    message: string
}

interface LogHistory extends TextHistory {
    level: string
}

interface WorkerMessage {
    event: string,
    payload: any
}