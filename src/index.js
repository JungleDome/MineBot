const config = require('./config.json');
const WebControlPanel = require('./webControl');
const BotSpawner = require('./botSpawner');

let controlPanel = new WebControlPanel(new BotSpawner());
controlPanel.initServer();