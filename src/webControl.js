const mineflayer = require('mineflayer');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config.json');
const BotSpawner = require('./botSpawner');
const path = require('path');

module.exports = class WebControl {
    /** @type {BotSpawner} */
    botSpawner = null;

    constructor(botSpawner) {
        this.botSpawner = botSpawner;

        this.app = express();
        this.app.use(express.static(path.join(__dirname, 'web')));
        this.app.use(bodyParser.json({ extended: true }));
    }

    initServer() {
        const port = config.webServer.port;

        this.registerRequest();

        this.app.listen(port, () => {
            console.log(`Web control started on ${port}`);
        });
    }

    sendSuccess(res, content) {
        res.status(200).send(content);
    }

    sendError(res, content) {
        res.status(501).send(content);
    }

    registerRequest() {
        let requests = [
            {
                method: 'GET',
                url: '/',
                /**
                 * 
                 * @param {express.Request} req 
                 * @param {express.Response} res 
                 */
                handler: (req, res) => {
                    res.render(path.join(__dirname, 'web', 'index.html'));
                }
            },
            {
                method: 'GET',
                url: '/config',
                /**
                 * 
                 * @param {express.Request} req 
                 * @param {express.Response} res 
                 */
                handler: (req, res) => {
                    this.sendSuccess(res, { servers: config.servers, bots: config.bots });
                }
            },
            {
                method: 'GET',
                url: '/currentBot',
                /**
                 * 
                 * @param {express.Request} req 
                 * @param {express.Response} res 
                 */
                handler: (req, res) => {
                    let onlineCount = this.botSpawner.botThreads.length;
                    let bots = this.botSpawner.botThreads.map(x => { return { id: x.id, username: x.botInfo.username, server: x.serverInfo, status: x.status }; });
                    this.sendSuccess(res, { bots: bots, online: onlineCount });
                }
            },
            {
                method: 'POST',
                url: '/getInfo',
                /**
                 * 
                 * @param {express.Request} req 
                 * @param {express.Response} res 
                 */
                handler: (req, res) => {
                    let botId = req.body['botId'];
                    let result = this.botSpawner.getBotInfo(botId);

                    this.sendSuccess(res, result);
                }
            },
            {
                method: 'POST',
                url: '/createBot',
                /**
                 * 
                 * @param {express.Request} req 
                 * @param {express.Response} res 
                 */
                handler: (req, res) => {
                    let serverIndex = parseInt(req.body['serverIndex']);
                    let botIndex = parseInt(req.body['botIndex']);
                    let selectedServer = config.servers[serverIndex];
                    let selectedBot = config.bots[botIndex];

                    if (!selectedServer || !selectedBot)
                        return this.sendError(res, { error: 'Please select a valid server and bot.' });

                    this.botSpawner.createBot(selectedServer, selectedBot);
                    this.sendSuccess(res, { status: 'OK' });
                }
            },
            {
                method: 'POST',
                url: '/restartBot',
                /**
                 * 
                 * @param {express.Request} req 
                 * @param {express.Response} res 
                 */
                handler: (req, res) => {
                    let botId = req.body['botId'];
                    let result = this.botSpawner.restartBot(botId);

                    if (result)
                        this.sendSuccess(res, { status: 'OK' });
                    else
                        this.sendError(res, { error: 'Please select a valid server and bot.' });
                }
            },
            {
                method: 'POST',
                url: '/stopBot',
                /**
                 * 
                 * @param {express.Request} req 
                 * @param {express.Response} res 
                 */
                handler: (req, res) => {
                    let botId = req.body['botId'];
                    let result = this.botSpawner.stopBot(botId);

                    if (result)
                        this.sendSuccess(res, { status: 'OK' });
                    else
                        this.sendError(res, { error: 'Please select a valid server and bot.' });
                }
            },
            {
                method: 'POST',
                url: '/commandBot',
                /**
                 * 
                 * @param {express.Request} req 
                 * @param {express.Response} res 
                 */
                handler: (req, res) => {
                    let command = req.body['command'];
                    let botId = req.body['botId'];

                    if (!command)
                        return this.sendError(res, { error: 'Command cannot be empty.' });

                    this.botSpawner.commandBot(botId, command);
                    this.sendSuccess(res, { status: 'OK' });
                }
            }
        ];

        requests.forEach(x => {
            if (x.method == 'GET') {
                this.app.get(x.url, x.handler);
            } else if (x.method == 'POST') {
                this.app.post(x.url, x.handler);
            } else {
                console.warn(`Unidentified request method (${x.method}).`);
            }
        });
    }
};