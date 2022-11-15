import { Router, Response } from 'express'
import WebServer from '../webServer';
import BotLoginInfo from '../model/botLoginInfo';
import ptimeout from 'promise.timeout';

export default function (app: Router, context: WebServer) {
    function sendSuccess(res: Response, content: Object) {
        res.status(200).send(content);
    }

    function sendError(res: Response, content: Object) {
        res.status(501).send(content);
    }

    app.post('/startBot', async (req, res) => {
        let { loginInfoId } = req.body;

        if (!loginInfoId)
            return sendError(res, { error: 'Please select a valid login info.' });

        const loginInfo = await BotLoginInfo.findOneBy({
            id: loginInfoId
        })

        if (!loginInfo)
            return sendError(res, { error: 'Please select a valid login info.' });

        let createBot = ptimeout(async () => { await context.botSpawner.createBot(loginInfo) }, 60 * 1000)
        try {
            await createBot()
        } catch (err) {
            return sendError(res, { error: { message: err } })
        }
        sendSuccess(res, { status: 'OK' });
    });

    app.post('/restartBot', (req, res) => {
        let botId = req.body['botId'];
        let result = context.botSpawner.restartBot(botId);

        if (result)
            sendSuccess(res, { status: 'OK' });
        else
            sendError(res, { error: 'Please select a valid server and bot.' });
    });

    app.post('/stopBot', (req, res) => {
        let botId = req.body['botId'];
        let result = context.botSpawner.stopBot(botId);

        if (result)
            sendSuccess(res, { status: 'OK' });
        else
            sendError(res, { error: 'Please select a valid server and bot.' });
    });

    app.post('/commandBot', (req, res) => {
        let command = req.body['command'];
        let botId = req.body['botId'];

        if (!command)
            return sendError(res, { error: 'Command cannot be empty.' });

        context.botSpawner.commandBot(botId, command);
        sendSuccess(res, { status: 'OK' });
    });

    return app;
};