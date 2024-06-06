import { useEffect, createContext, useState } from 'react';
import PropTypes from 'prop-types';
import Popup from '../components/Popup';
import lostSong from '../assets/gameLost.mp3';
import winSong from '../assets/gameWin.mp3';

export const GameContext = createContext();

const initialGameState = {
    gameLaunched: false,
    gamePaused: false,
    gameFinished: false,
    secondsLeft: 30,
    gameStatus: '',
    difficulty: 1,
    photo_res0: 1200,
    photo_res1: 1200,
    photo_res2: 1200,
    pressure: 1200,
    led: { color: 'WHITE', status: 'OFF' },
    currentTouch: [false, false, false],
    tresorTaken: false
};

const GameProvider = ({ children }) => {
    const [game, setGame] = useState(initialGameState);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [audio, setAudio] = useState(null);

    const resetGame = () => {
        console.log('Resetting game');
        setGame(initialGameState);
        closePopup();
    }

    const gameOngoing = game.gameLaunched && !game.gamePaused && !game.gameFinished;

    const changeDiffulty = (difficulty) => {
        if (!game.gameLaunched && !game.gamePaused) {
            setGame(prevGame => ({
                ...prevGame,
                difficulty
            }));
        }
    }

    const changeLed = (color, status) => {
        setGame(prevGame => ({
            ...prevGame,
            led: { color, status }
        }));
    }

    const closePopup = () => {
        setShowPopup(false);
    }

    const playAudio = (src, volume = 1) => {
        if (audio) audio.pause();
        const newAudio = new Audio(src);
        newAudio.volume = volume;
        setAudio(newAudio);
        newAudio.play();
    }

    useEffect(() => {
        console.log('Game updated currentTouch:', game.currentTouch);
        let touchCount = game.difficulty === 1 ? 3 : game.difficulty === 2 ? 2 : 1;
        let nbTouch = game.currentTouch.filter(touch => touch).length;
        console.log('nbTouch:', nbTouch);
        console.log('touchCount:', touchCount);

        if (nbTouch >= touchCount || (game.gameFinished && !game.tresorTaken)) {
            console.log('You lost!');
            setPopupMessage('Vous avez perdu! 😭');
            setShowPopup(true);
            setGame(prevGame => ({
                ...prevGame,
                gameFinished: true,
                gameStatus: 'lost',
                led: { color: 'RED', status: 'ON' }
            }));
            playAudio(lostSong);
        } else if (game.gameFinished && game.tresorTaken) {
            console.log('You win!');
            setPopupMessage('Vous avez gagné! 🏆');
            setShowPopup(true);
            setGame(prevGame => ({
                ...prevGame,
                gameFinished: true,
                gameStatus: 'won',
                led: { color: 'GREEN', status: 'ON' }
            }));
            playAudio(winSong);
        }
    }, [game.currentTouch, game.gameFinished]);

    return (
        <GameContext.Provider value={{ game, setGame, resetGame, gameOngoing, changeDiffulty, changeLed, playAudio }}>
            {children}
            {showPopup && <Popup message={popupMessage} onClose={closePopup} className={game.gameStatus}/>}
        </GameContext.Provider>
    );
};

GameProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default GameProvider;
