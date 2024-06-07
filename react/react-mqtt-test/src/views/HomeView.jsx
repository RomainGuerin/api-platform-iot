import { useEffect, useState, useMemo, useContext } from 'react';
import { GameContext } from '../models/GameContext';
import mqttService from '../controllers/mqttService';
import Timer from '../components/Timer';
import Difficulty from '../components/Difficulty';
import hit1 from '../assets/hitMinecraft.mp3';
import hit2 from '../assets/hitRoblox.mp3';
import hit3 from '../assets/hitGogole.mp3';

const HomeView = () => {
    const { game, setGame, gameOngoing, playAudio } = useContext(GameContext);
    const [messages, setMessages] = useState([]);

    const topics = useMemo(() => [
        'topic/esiee/escape/photo_res0',
        'topic/esiee/escape/photo_res1',
        'topic/esiee/escape/photo_res2',
        'topic/esiee/escape/led',
        'topic/esiee/escape/pressure',
    ], []);

    const maxSensorValue = [20, 50, 50, 450];

    useEffect(() => {
        mqttService.connect();

        topics.forEach(topic => mqttService.subscribe(topic));

        mqttService.setOnMessageCallback((topic, message) => {
            setMessages(prevMessages => [...prevMessages, { topic, message }]);
        });

        return () => {
            mqttService.disconnect();
        };
    }, []);

    useEffect(() => {
        const handlePhotoResMessage = (index, audioFile, message) => {
            if (game.currentTouch[index]) return;
            console.log(`Processing photo_res${index} message`, message.split(',')[1]);
            const photoRes = parseInt(message.split(',')[1]);
            setGame(prevGame => ({
                ...prevGame,
                [`photo_res${index}`]: photoRes
            }));
            if (photoRes <= maxSensorValue[index]) {
                const newTouch = [...game.currentTouch];
                newTouch[index] = true;
                setGame(prevGame => ({
                    ...prevGame,
                    currentTouch: newTouch
                }));
                playAudio(audioFile);
            }
        };

        const handlePressureMessage = (message) => {
            if (game.tresorTaken) return;
            console.log('Processing pressure message', message);
            const pressure = parseInt(message.split(',')[1]);
            setGame(prevGame => ({
                ...prevGame,
                pressure
            }));
            if (pressure <= maxSensorValue[3]) {
                setGame(prevGame => ({
                    ...prevGame,
                    tresorTaken: true
                }));
            }
        };

        const processMessage = (topic, message) => {
            console.log('Received message on topic:', topic, message);
            switch (topic) {
                case 'topic/esiee/escape/photo_res0':
                    handlePhotoResMessage(0, hit1, message);
                    break;
                case 'topic/esiee/escape/photo_res1':
                    handlePhotoResMessage(1, hit2, message);
                    break;
                case 'topic/esiee/escape/photo_res2':
                    handlePhotoResMessage(2, hit3, message);
                    break;
                case 'topic/esiee/escape/pressure':
                    handlePressureMessage(message);
                    break;
                default:
                    console.log('No handler for topic:', topic);
                    break;
            }
        };
        
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (topics.includes(lastMessage.topic) && gameOngoing === true) {
                try {
                    processMessage(lastMessage.topic, lastMessage.message);
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            }
        }
    }, [messages]);

    useEffect(() => {
        if (game.gameFinished) {
            handleLedStatusFinal();
        }
    }, [game.led]);

    const handleLedStatusFinal = () => {
        const topic = 'topic/esiee/escape/led';
        mqttService.publish(topic, game.led.status + ',' + game.led.color);
    };

    const handleLedStatus = (status, color) => {
        const topic = 'topic/esiee/escape/led';
        mqttService.publish(topic, status + ',' + color);
    };

    return (
        <div>
            <h1>Laser Lockdown</h1>
            <h2>Le casse ultime</h2>
            <Difficulty />
            <br />
            <hr />
            <Timer action={handleLedStatus} />
        </div>
    );
};

export default HomeView;
