import React, { useEffect, useState } from 'react';
import Button from '../components/ButtonARCHIVE';
import mqttService from '../controllers/mqttServiceARCHIVE';

const HomeView = () => {
    const { messages, publish, connectStatus } = mqttService();

    return (
        <div>
            <h1>MQTT Status: {connectStatus}</h1>
            <button onClick={() => publish('0013A20041FB6072', 'Hello MQTT!')}>
                Publish Message
            </button>
            <Button data={{ title: 'MQTT Messages', description: messages.join(', ') }} />
        </div>
    );
};

export default HomeView;