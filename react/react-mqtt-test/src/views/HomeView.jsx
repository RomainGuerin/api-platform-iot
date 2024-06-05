// src/views/HomeView.jsx
import React, { useEffect, useState } from 'react';
import mqttService from '../controllers/mqttService';
import Button from '../components/Button';
import Timer from '../components/Timer';

const HomeView = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        mqttService.connect();
        mqttService.subscribe('topic/esiee/escape/management');
        mqttService.subscribe('topic/esiee/escape/photo_res0');
        mqttService.subscribe('topic/esiee/escape/photo_res1');
        mqttService.subscribe('topic/esiee/escape/photo_res2');
        mqttService.subscribe('topic/esiee/escape/led');
        mqttService.subscribe('topic/esiee/escape/pressure');

        mqttService.setOnMessageCallback((topic, message) => {
            setMessages((prevMessages) => [...prevMessages, { topic, message }]);
        });

        return () => {
            mqttService.disconnect();
        };
    }, []);

    useEffect(() => {
        const message = messages.find((msg) => msg.topic === 'topic/esiee/escape/photo_res0');
        if (message) {
            console.log('Received message ');
            // ex:
            // topic = topic/esiee/escape/photo_res0
            // message = "00000000,1200"
        }
    }, [messages]);

    const handlePublish = () => {
        const topic = 'topic/esiee/escape/photo_res0';
        const message = 'Hello MQTT';
        mqttService.publish(topic, message);
    };

    const handleTimerStart = (messageToSend) => {
        const topic = 'topic/esiee/escape/led';
        mqttService.publish(topic, messageToSend);
    };

    const resetMessages = () => {
        setMessages([]);
    };

    return (
        <div>
            <h1>Home</h1>
            <Button>Difficulté 1</Button>
            <Button>Difficulté 2</Button>
            <Button>Difficulté 3</Button>
            <Timer action={handleTimerStart} />
            <br/>
            <Button onClick={handlePublish}>Publish Message</Button>
            <div>
                <h2>Received Messages</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}><strong>{msg.topic}:</strong> {msg.message}</li>
                    ))}
                </ul>
            </div>
            <Button onClick={resetMessages}>Clear Messages</Button>
        </div>
    );
};

export default HomeView;
