import BotSpawner from "./botSpawner";
import express from "express";
import config from './config.json'
import path from 'node:path'
import bodyParser from "body-parser";
import apiRoutes from './router/api'

export default class WebServer {
    public botSpawner: BotSpawner
    public app: express.Express

    public constructor(botSpawner: BotSpawner) {
        this.botSpawner = botSpawner

        this.app = express();
        this.app.use(express.static(path.join(__dirname, '..', 'public')));
        //@ts-ignore
        this.app.use(bodyParser.json({ extended: true }));
        this.app.use('/api', apiRoutes(express.Router(), this))
    }

    public initServer(): void {
        this.registerPage();
        let port = config.webServer.port

        this.app.listen(port, () => {
            console.log(`Web control started on ${port}`);
        });
    }

    public registerPage(): void {
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname,'..', 'public', 'index.html'));
        })
    }
};