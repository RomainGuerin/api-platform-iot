const SerialPort = require('serialport');
const xbee_api = require('xbee-api');
const mqttController = require('./mqtt_controller');
const Topics = require('./topics');
const Configs = require('./configs');
require('dotenv').config();

const { FRAME_TYPE } = xbee_api.constants;
const { discoverXbeeNodes, handleIncomingData } = require('./xbee_controller');

let authorizedXbees = {};
const SERIAL_PORT = process.env.SERIAL_PORT;
const BAUD_RATE = parseInt(process.env.SERIAL_BAUDRATE) || 9600;

const xbeeAPI = new xbee_api.XBeeAPI({ api_mode: 2 });
let serialport = new SerialPort(SERIAL_PORT, { baudRate: BAUD_RATE }, handleSerialPortError);

serialport.pipe(xbeeAPI.parser);
serialport.on('open', startXbeeDiscovery);

xbeeAPI.builder.pipe(serialport);
xbeeAPI.parser.on('data', frame => handleIncomingData(frame, authorizedXbees, mqttController));

mqttController.ledSetupCallback(setLedColor);

function handleSerialPortError(err) {
  if (err) {
    console.error('Error with Serial Port: ', err.message);
  }
}

function startXbeeDiscovery() {
  discoverXbeeNodes(xbeeAPI);
  setInterval(() => manageXbeeDiscovery(xbeeAPI, authorizedXbees), Configs.DELAY_DISCOVER);
}

function manageXbeeDiscovery(xbeeAPI, authorizedXbees) {
    if(Object.keys(authorizedXbees).length != 4) {
        console.log("We search our XBee, We've register :", Object.keys(authorizedXbees).length, "nodes");
        discoverXbeeNodes(xbeeAPI);
    }
}

function setLedColor(state, color) {
  turnOffAllLeds();
  if (state === Configs.STATE_OFF) return;
  setColorLed(color);
}

function setColorLed(color) {
  if (color in Configs.LED_MAPPING) {
    const ports = Array.isArray(Configs.LED_MAPPING[color]) ? Configs.LED_MAPPING[color] : [Configs.LED_MAPPING[color]];
    ports.forEach(port => setLed(port, LED_ON));
  } else {
    console.warn('Unknown color ', color);
  }
}

function turnOffAllLeds() {
  Configs.LED_MAPPING.WHITE.forEach(port => setLed(port, LED_OFF));
}

function setLed(port, state) {
  const destination = findXbeeDestination(Topics.PRESSURE);
  if (destination) {
    const command = `D${port}`;
    sendXbeeCommand(destination, command, [state]);
  }
}

function findXbeeDestination(topic) {
  return Object.keys(authorizedXbees).find(key => authorizedXbees[key] === topic);
}

function sendXbeeCommand(destination, command, parameters) {
  const apiFrame = {
    type: FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: destination,
    command: command,
    commandParameter: parameters
  };
  xbeeAPI.builder.write(apiFrame);
}
