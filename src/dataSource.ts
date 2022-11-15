import Session from './model/session'
import { DataSource } from 'typeorm'
import BotLoginInfo from './model/botLoginInfo'

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "data.sqlite",
    // synchronize: true,
    logging: false,
    entities: [BotLoginInfo, Session],
    subscribers: [],
    migrations: ['./dist/migrations/*'],
})