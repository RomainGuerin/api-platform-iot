import mqtt from 'mqtt';

const MQTT_BROKER_URL = 'wss://test.mosquitto.org:8081';
const CLIENT_ID = '0013A20041FB6072';

class MqttService {
    constructor() {
        this.client = null;
        this.messageCallback = null;
    }

    connect() {
        this.client = mqtt.connect(MQTT_BROKER_URL, {
            clientId: CLIENT_ID,
            protocol: 'wss',
        });

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
        });

        this.client.on('error', (err) => {
            console.error('MQTT connection error:', err);
        });

        this.client.on('message', (topic, message) => {
            console.log('Received message:', topic, message.toString());

            if (this.messageCallback) {
                this.messageCallback(topic, message.toString());
            }
        });
    }

    subscribe(topic) {
        if (this.client) {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                } else {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        }
    }

    publish(topic, message) {
        if (this.client) {
            this.client.publish(topic, message);
            console.log(`Published message: ${message} to topic: ${topic}`);
        }
    }

    setOnMessageCallback(callback) {
        this.messageCallback = callback;
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            console.log('Disconnected from MQTT broker');
        }
    }
}

const mqttService = new MqttService();
export default mqttService;
