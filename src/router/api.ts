import { Router, Response } from 'express'
import WebServer from '../webServer';
import config from '../config.json'
import bot_api from './bot_api';
import bot_crud from './bot_crud';
import _enum from './enum'
import stats from './stats';
import dashboard from './dashboard';

export default function (app: Router, context: WebServer) {
    function sendSuccess(res: Response, content: Object) {
        res.status(200).send(content);
    }

    // function sendError(res: Response, content: Object) {
    //     res.status(501).send(content);
    // }

    app.get('/config', (req, res) => {
        sendSuccess(res, { servers: config.servers, bots: config.bots });
    });

    app.get('/currentBot', (req, res) => {
        let onlineCount = context.botSpawner.botThreads.length;
        let bots = context.botSpawner.botThreads.map(x => { return { id: x.id, username: x.loginInfo.username, server: { host: x.loginInfo.serverHost, port: x.loginInfo.serverPort }, status: x.status }; });
        sendSuccess(res, { bots: bots, online: onlineCount });
    });

    app.post('/getInfo', (req, res) => {
        let botId = req.body['botId'];
        let result = context.botSpawner.getBotInfo(botId);

        sendSuccess(res, result);
    });

    //Register individual bot api
    bot_api(app, context)
    bot_crud(app, context)
    _enum(app, context)
    stats(app, context)
    dashboard(app, context)

    return app;
};