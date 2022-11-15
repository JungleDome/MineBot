import { Router, Response } from 'express'
import WebServer from '../webServer';
import BotLoginInfo from '../model/botLoginInfo';

export default function (app: Router, context: WebServer) {
    function sendSuccess(res: Response, content: Object) {
        res.status(200).send(content);
    }

    function sendError(res: Response, content: Object) {
        res.status(501).send(content);
    }

    app.post('/createBot', async (req, res) => {
        let { username, password, serverHost, serverPort, serverVersion, cracked } = req.body;
        serverPort = parseInt(serverPort)

        if (!(username && password && serverHost && serverPort && serverVersion))
            return sendError(res, { error: 'Invalid input.' });

        let newLoginInfo = new BotLoginInfo()
        newLoginInfo.username = username
        newLoginInfo.password = password
        newLoginInfo.serverHost = serverHost
        newLoginInfo.serverPort = serverPort
        newLoginInfo.serverVersion = serverVersion
        newLoginInfo.cracked = cracked
        await newLoginInfo.save()

        sendSuccess(res, { status: 'OK' });
    });

    app.post('/updateBot', async (req, res) => {
        let { loginInfoId, username, password, serverHost, serverPort, serverVersion, cracked } = req.body;
        serverPort = parseInt(serverPort)

        if (!(username && password && serverHost && serverPort && serverVersion))
            return sendError(res, { error: 'Invalid input.' });

        if (!loginInfoId)
            return sendError(res, { error: 'Please select a valid login info.' });

        const loginInfo = await BotLoginInfo.findOneBy({
            id: loginInfoId
        })

        if (!loginInfo)
            return sendError(res, { error: 'Please select a valid login info.' });

        loginInfo.username = username
        loginInfo.password = password
        loginInfo.serverHost = serverHost
        loginInfo.serverPort = serverPort
        loginInfo.serverVersion = serverVersion
        loginInfo.cracked = cracked
        await loginInfo.save()

        sendSuccess(res, { status: 'OK' });
    });

    app.get('/listBot', async (req, res) => {
        let loginInfos = await BotLoginInfo.find()

        for (let loginInfo of loginInfos) {
            //@ts-ignore
            loginInfo.online = !!context.botSpawner.getBot(loginInfo.id)
        }

        sendSuccess(res, { status: 'OK', list: loginInfos });
    });

    app.post('/getBot', async (req, res) => {
        let { loginInfoId } = req.body;

        if (!loginInfoId)
            return sendError(res, { error: 'Please select a valid login info.' });

        const loginInfo = await BotLoginInfo.findOneBy({
            id: loginInfoId
        })

        if (!loginInfo)
            return sendError(res, { error: 'Please select a valid login info.' });

        sendSuccess(res, { status: 'OK', bot: loginInfo });
    });

    app.post('/deleteBot', async (req, res) => {
        let { loginInfoId } = req.body;

        if (!loginInfoId)
            return sendError(res, { error: 'Please select a valid login info.' });

        const loginInfo = await BotLoginInfo.findOne({
            where: {
                id: loginInfoId,
            },
            relations: ['sessions']
        })

        if (!loginInfo)
            return sendError(res, { error: 'Please select a valid login info.' });

        context.botSpawner.stopBot(loginInfoId)
        loginInfo.softRemove()
        sendSuccess(res, { status: 'OK' });
    });

    return app;
};