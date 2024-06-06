import { useEffect, useState, useMemo, useContext } from 'react';
import { GameContext } from '../models/GameContext';
import mqttService from '../controllers/mqttService';
import Button from '../components/Button';
import Timer from '../components/Timer';
import Difficulty from '../components/Difficulty';
import StatView from './StatView';
import hit1 from '../assets/hitMinecraft.mp3';
import hit2 from '../assets/hitRoblox.mp3';
import hit3 from '../assets/hitGogole.mp3';

const HomeView = () => {
    const { game, setGame, gameOngoing } = useContext(GameContext);
    const [messages, setMessages] = useState([]);
    const [audio, setAudio] = useState(null);

    const topics = useMemo(() => [
        'topic/esiee/escape/management',
        // 'topic/esiee/escape/photo_res0',
        'topic/esiee/escape/photo_res1',
        'topic/esiee/escape/photo_res2',
        'topic/esiee/escape/led',
        'topic/esiee/escape/pressure',
    ], []);

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
        let lastMessage = messages.slice().reverse()[0];
        if (lastMessage) {
            try {
                if (topics.includes(lastMessage.topic) && gameOngoing === true) {
                    console.log('Received message on topic:', lastMessage.topic, lastMessage.message);
                    switch (lastMessage.topic) {
                        case 'topic/esiee/escape/photo_res0':
                            if (game.currentTouch[0] === true) { return };
                            console.log('Processing photo_res0 message', lastMessage.message.split(',')[1]);
                            var photo_res0 = parseInt(lastMessage.message.split(',')[1]);
                            setGame(prevGame => ({
                                ...prevGame,
                                photo_res0: photo_res0
                            }));
                            if (photo_res0 <= 450) {
                                setGame(prevGame => ({
                                    ...prevGame,
                                    currentTouch: [true, ...prevGame.currentTouch.slice(1)]
                                }));
                                const newAudio = new Audio(hit1);
                                setAudio(newAudio);
                                newAudio.play();
                            }
                            break;
                        case 'topic/esiee/escape/photo_res1':
                            if (game.currentTouch[1] === true) { return };
                            console.log('Processing photo_res1 message');
                            var photo_res1 = parseInt(lastMessage.message.split(',')[1]);
                            setGame(prevGame => ({
                                ...prevGame,
                                photo_res1: photo_res1
                            }));
                            if (photo_res1 <= 450) {
                                setGame(prevGame => ({
                                    ...prevGame,
                                    currentTouch: [...prevGame.currentTouch.slice(0, 1), true, ...prevGame.currentTouch.slice(2)]
                                }));
                                const newAudio = new Audio(hit2);
                                setAudio(newAudio);
                                newAudio.play();
                            }
                            break;
                        case 'topic/esiee/escape/photo_res2':
                            if (game.currentTouch[2] === true) { return };
                            console.log('Processing photo_res2 message');
                            var photo_res2 = parseInt(lastMessage.message.split(',')[1]);
                            setGame(prevGame => ({
                                ...prevGame,
                                photo_res2: photo_res2
                            }));
                            if (photo_res2 <= 450) {
                                setGame(prevGame => ({
                                    ...prevGame,
                                    currentTouch: [...prevGame.currentTouch.slice(0, 2), true, ...prevGame.currentTouch.slice(3)]
                                }));
                                const newAudio = new Audio(hit3);
                                setAudio(newAudio);
                                newAudio.play();
                            }
                            break;
                        case 'topic/esiee/escape/led':
                            console.log('Processing led message');
                            var [status, color] = lastMessage.message.split(',');
                            setGame(prevGame => ({
                                ...prevGame,
                                led: { color, status }
                            }));
                            break;
                        case 'topic/esiee/escape/pressure':
                            console.log('Processing pressure message', lastMessage.message);
                            var pressure = parseInt(lastMessage.message.split(',')[1]);
                            setGame(prevGame => ({
                                ...prevGame,
                                pressure: pressure
                            }));
                            if (pressure <= 450) {
                                setGame(prevGame => ({
                                    ...prevGame,
                                    tresorTaken: true
                                }));
                            }
                            break;
                        default:
                            console.log('Unknown topic:', lastMessage.topic);
                            break;
                    }
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        }
    }, [messages]);

    const handlePublishTEST = () => {
        const topic = 'topic/esiee/escape/pressure';
        const message = 'tests,200';
        mqttService.publish(topic, message);
    };

    const handleTimerStart = (messageToSend) => {
        const topic = 'topic/esiee/escape/led';
        mqttService.publish(topic, messageToSend);
    };

    const resetMessages = () => {
        setMessages([]);
    };

    const consoleGame = () => {
        console.log(game);
    }

    return (
        <div>
            <h1>Laser Lokcdown</h1>
            <h2>Le casse ultime</h2>
            <Difficulty />
            <br />
            <hr />
            <Timer action={handleTimerStart} />
            {/* temporaire */}
            <br />
            <hr />
            <br />
            <Button onClick={handlePublishTEST}>Publish Message</Button>
            <div>
                <h2>Received Messages</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}><strong>{msg.topic}:</strong> {msg.message}</li>
                    ))}
                </ul>
            </div>
            <Button onClick={resetMessages}>Clear Messages</Button>
            <Button onClick={consoleGame}>consoleGame</Button>
            <br />
            <br />
            <hr />
            <StatView />
        </div>
    );
};

export default HomeView;
