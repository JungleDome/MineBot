import { Router, Response } from 'express'
import WebServer from '../webServer';
import { Status } from '../botSpawner';

export default function (app: Router, context: WebServer) {
    function sendSuccess(res: Response, content: Object) {
        res.status(200).send(content);
    }

    app.get('/enums', async (req, res) => {
        sendSuccess(res, { status: 'OK', enums: {Status} });
    });

    return app;
};