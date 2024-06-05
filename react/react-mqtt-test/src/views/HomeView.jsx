import { useEffect, useState, useMemo, useContext } from 'react';
import { GameContext } from '../models/GameContext';
import mqttService from '../controllers/mqttService';
import Button from '../components/Button';
import Timer from '../components/Timer';
import StatView from './StatView';

const HomeView = () => {
    const { game, setGame } = useContext(GameContext);
    const [messages, setMessages] = useState([]);

    const topics = useMemo(() => [
        'topic/esiee/escape/management',
        'topic/esiee/escape/photo_res0',
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
                if (topics.includes(lastMessage.topic)) {
                    console.log('Received message on topic:', lastMessage.topic, lastMessage.message);
                    switch (lastMessage.topic) {
                        case 'topic/esiee/escape/photo_res0':
                            console.log('Processing photo_res0 message');
                            var photo_res0 = parseInt(lastMessage.message.split(',')[0], 10);
                            setGame(prevGame => ({
                                ...prevGame,
                                photo_res0: photo_res0
                            }));
                            if (photo_res0 <= 450) {
                                setGame(prevGame => ({
                                    ...prevGame,
                                    currentTouch: [true, ...prevGame.currentTouch.slice(1)]
                                }));
                            }
                            break;
                        case 'topic/esiee/escape/photo_res1':
                            console.log('Processing photo_res1 message');
                            var photo_res1 = parseInt(lastMessage.message.split(',')[0], 10);
                            setGame(prevGame => ({
                                ...prevGame,
                                photo_res1: photo_res1
                            }));
                            if (photo_res1 <= 450) {
                                setGame(prevGame => ({
                                    ...prevGame,
                                    currentTouch: [...prevGame.currentTouch.slice(0, 1), true, ...prevGame.currentTouch.slice(2)]
                                }));
                            }
                            break;
                        case 'topic/esiee/escape/photo_res2':
                            console.log('Processing photo_res2 message');
                            var photo_res2 = parseInt(lastMessage.message.split(',')[0], 10);
                            setGame(prevGame => ({
                                ...prevGame,
                                photo_res2: photo_res2
                            }));
                            if (photo_res2 <= 450) {
                                setGame(prevGame => ({
                                    ...prevGame,
                                    currentTouch: [...prevGame.currentTouch.slice(0, 2), true, ...prevGame.currentTouch.slice(3)]
                                }));
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
                            console.log('Processing pressure message');
                            var pressure = parseInt(lastMessage.message, 10);
                            setGame(prevGame => ({
                                ...prevGame,
                                pressure: pressure
                            }));
                            if (pressure <= 450) {
                                setGame(prevGame => ({
                                    ...prevGame,
                                    currentTouch: [...prevGame.currentTouch.slice(0, 3), true]
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

    const changeDiffulty = (difficulty) => {
        setGame(prevGame => ({
            ...prevGame,
            difficulty
        }));
    };

    const handlePublishTEST = () => {
        const topic = 'topic/esiee/escape/photo_res1';
        const message = '200';
        mqttService.publish(topic, message);
    };

    const handleTimerStart = (messageToSend) => {
        const topic = 'topic/esiee/escape/led';
        mqttService.publish(topic, messageToSend);
    };

    const resetMessages = () => {
        setMessages([]);
    };

    const selectedDifficulty = (difficulty, gameDifficulty) => {
        if (difficulty === gameDifficulty) {
            return 'difficulte-selected';
        } else {
            return 'difficulte-not-selected';
        }
    }

    const consoleGame = () => {
        console.log(game);
    }

    return (
        <div>
            <h1>Home</h1>
            {/* nouvelle view pour difficulty + bloquer une fois start */}
            <div className='button-grid'>
                <Button onClick={() => changeDiffulty(1)} className={selectedDifficulty(1, game.difficulty)}>Difficulté 1</Button>
                <Button onClick={() => changeDiffulty(2)} className={selectedDifficulty(2, game.difficulty)}>Difficulté 2</Button>
                <Button onClick={() => changeDiffulty(3)} className={selectedDifficulty(3, game.difficulty)}>Difficulté 3</Button>
            </div>
            <br />
            <hr />
            <Timer action={handleTimerStart} />
            <br />
            <hr />
            <br />
            {/* temporaire */}
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
