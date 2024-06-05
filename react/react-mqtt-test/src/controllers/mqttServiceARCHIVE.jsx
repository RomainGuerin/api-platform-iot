import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const mqttService = () => {
    const [messages, setMessages] = useState([]);
    const [client, setClient] = useState(null);
    const [connectStatus, setConnectStatus] = useState('Disconnected');

    useEffect(() => {
        const client = mqtt.connect('wss://test.mosquitto.org:8081');
        setClient(client);

        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            setConnectStatus('Connected');
            client.subscribe('0013A20041FB6072', (err) => {
                if (err) {
                    console.error('Subscription error: ', err);
                } else {
                    console.log('Subscribed successfully');
                }
            });
        });

        client.on('error', (err) => {
            console.error('Connection error: ', err);
            setConnectStatus('Connection error');
            client.end();
        });

        client.on('reconnect', () => {
            console.log('Reconnecting');
            setConnectStatus('Reconnecting');
        });

        client.on('message', (topic, message) => {
            console.log(topic, message.toString());
            setMessages(prevMessages => [...prevMessages, message.toString()]);
        });

        return () => {
            client.end();
        };
    }, []);

    const publish = (topic, message) => {
        if (client && client.connected) {
            client.publish(topic, message);
        } else {
            console.error('Cannot publish, client not connected');
        }
    };

    return {
        messages,
        publish,
        connectStatus
    };
};

export default mqttService;