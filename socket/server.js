const SerialPort = require('serialport');
const xbee_api = require('xbee-api');
const C = xbee_api.constants;
const mqtt_controller = require('./mqtt_controller');
const Topics = require('./topics');
const { auth } = require('firebase-admin');
require('dotenv').config();

const SERIAL_PORT = process.env.SERIAL_PORT;

let authorizedXbees = {};

const xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

let serialport = new SerialPort(SERIAL_PORT, {
  baudRate: parseInt(process.env.SERIAL_BAUDRATE) || 9600,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message);
  }
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

serialport.on("open", function () {
  discoverXbees();
  setInterval(discoverXbees, 10000);
  });

mqtt_controller.led_setup_callback(set_led_color);

function set_led_color(state, color) {
  off_all_leds();
  console.log("state", state, "color", color)
  if(state === "OFF") {
    return;
  }
  if(color === "BLUE") {
    set_led(3, 0x04);
  } else if (color === "GREEN") {
    set_led(2, 0x04);
  } else if (color === "RED") {
    set_led(1, 0x04);
  } else if (color === "WHITE") {
    set_led(3, 0x04);
    set_led(2, 0x04);
    set_led(1, 0x04);
  } else {
    console.warn("Unknown color ", color);
  }
}

function off_all_leds() {
  // 1, 2, 3
  set_led(1, 0x05); // RED
  set_led(2, 0x05); // GREEN
  set_led(3, 0x05); // BLUE
}


function set_led(port, state) {
  // Create API frame for remote AT command
  destination = getKeyByValue(authorizedXbees, Topics.PRESSURE);
  // console.log("destination:", destination, authorizedXbees);
  if(destination) {
    let commande = "D" + port;
    // console.log("Set", destination, "led", port, "to", state);
    const apiFrame = {
      type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
      destination64: destination, // Replace with 64-bit address of XBee module that controls LED
      command: commande, // DIO configuration command
      commandParameter: [state] // e.g. [0x04] for low, [0x05] for high
    };
    xbeeAPI.builder.write(apiFrame);
    // console.log("APIFrame", apiFrame);

    // Send API frame to XBee
    // xbee.send(apiFrame, function(err, data) {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     console.log("LED state updated: " + state);
    //   }
    // });
  }
}

function discoverXbees() {
  let frame_obj = {
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "ND",
    commandParameter: []
  };

  xbeeAPI.builder.write(frame_obj);
}

function isAllowedXbee(remote64) {
  return authorizedXbees.hasOwnProperty(remote64);
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);

}

xbeeAPI.parser.on("data", function (frame) {
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    console.log("C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET");
    let dataReceived = String.fromCharCode.apply(null, frame.data);
    console.log(">> ZIGBEE_RECEIVE_PACKET >", dataReceived);

  } else if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
    
  } else if (C.FRAME_TYPE.AT_COMMAND_RESPONSE === frame.type && frame.command === "ND") {
    // console.log("AT_COMMAND_RESPONSE", frame);
    if(frame.command === "ND"){
      // console.log("AT_COMMAND_RESPONSE - ND", frame);
      if (frame.nodeIdentification) {
        const remote64 = frame.nodeIdentification.remote64.toString('hex');
        const nodeIdentifier = frame.nodeIdentification.nodeIdentifier;
        if(!isAllowedXbee(remote64)) {
          console.log("nodeIdentification = ", nodeIdentifier);
          topic = "";
          switch(nodeIdentifier) {
            case "Laser 1":
              topic = Topics.PHOTO_RES1;
              break;
            case "Laser 2":
              topic = Topics.PHOTO_RES0;
              break;
            case "Laser 3":
              topic = Topics.PHOTO_RES2;
              break;
            case "Plaque Pression":
              topic = Topics.PRESSURE;
              break;
            default:
              topic = "";
              break;
          }
          if(topic != "") {
            authorizedXbees[remote64] = topic;
            console.log(`XBee Discovered: ${remote64} - ${nodeIdentifier}`);
          }
        }
      }
    }
  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {
    if (isAllowedXbee(frame.remote64)) {
      // console.log("ZIGBEE_IO_DATA_SAMPLE_RX", frame);
      let data_to_send = `${frame.remote64},${frame.analogSamples.AD0}`;
      console.log(authorizedXbees[frame.remote64], frame.analogSamples.AD0)
      mqtt_controller.mqtt_send_data(authorizedXbees[frame.remote64], data_to_send);
    } else {
      // console.warn(`Unauthorized XBee: ${frame.remote64}`);
    }
  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    // console.log("REMOTE_COMMAND_RESPONSE", frame);
  } else {
    console.debug(frame);
    if (frame.commandData) {
      let dataReceived = String.fromCharCode.apply(null, frame.commandData);
      console.log(dataReceived);
    }
  }
});
