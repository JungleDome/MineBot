import "reflect-metadata";
import { AppDataSource } from './dataSource';
import WebServer from './webServer'
import BotSpawner from './botSpawner'
import { Stats } from "./stats";


AppDataSource.initialize().then(() => {
    let controlPanel = new WebServer(new BotSpawner());
    controlPanel.initServer();

    Stats.startWebSession()
}).catch((error) => console.error(error));