/* MQTT Saving steps */
const mqtt = require('mqtt');
const Topics = require('./topics');

const client = mqtt.connect('mqtt://test.mosquitto.org'); 
const message = 'test message'; 

client.on('connect', () => {
    console.log(`Is client connected: ${client.connected}`);    
    if (client.connected) {
        console.log(`message: ${message}, topic: ${Topics.MANAGEMENT}`); 
        client.publish(Topics.MANAGEMENT, message);
    }
    client.subscribe(Topics.LED);
});

function mqttSendData(topic, data) {
    if (typeof data === 'string' && data !== null) {
        try {
            client.publish(topic, data);
        } catch (error) {
            console.error(`Erreur lors de la publication des données : ${error}`);
        }
    } else {
        console.error('Données invalides : doivent être une chaîne de caractères');
    }
}

function ledSetupCallback(callback_led) {
    client.on('message', (topic, message) => {
        let messageArray = message.toString().split(",");
        if(messageArray[0] === Configs.STATE_ON) {
            console.log("On allume la led en", messageArray[1]);
        } else if (messageArray[0] === "OFF") {
            console.log("On eteint la led");
        } else { 
            console.log(`Message: ${message.toString()}, Topic: ${topic}`); 
        }
        callback_led(messageArray[0], messageArray[1]);
    });
}

client.on('error', (error) => {
    console.error(error);
    process.exit(1);
});

module.exports = {
    mqttSendData,
    ledSetupCallback
};
