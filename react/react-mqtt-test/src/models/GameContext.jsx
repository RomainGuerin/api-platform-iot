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
    difficulty: 1,
    photo_res0: 1200,
    photo_res1: 1200,
    photo_res2: 1200,
    led: { color: 'WHITE', status: 'OFF' },
    pressure: 1200,
    currentTouch: [false, false, false],
    tresorTaken: false,
    timeLeft: 0,
    gameStatus: ''
};

const GameProvider = ({ children }) => {
    const [game, setGame] = useState(initialGameState);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [audio, setAudio] = useState(null);

    const resetGame = () => {
        console.log('Resetting game');
        setGame(initialGameState);
        setShowPopup(false);
    }

    const gameOngoing = game.gameLaunched && !game.gamePaused && !game.gameFinished;

    const changeDiffulty = (difficulty) => {
        if (!game.gameLaunched && !game.gamePaused) {
            setGame(prevGame => ({
                ...prevGame,
                difficulty: difficulty
            }));
        }
    }

    const closePopup = () => {
        setShowPopup(false);
    }

    useEffect(() => {
        console.log('Game updated currentTouch:', game.currentTouch);
        let touchCount = game.difficulty === 1 ? 3 : game.difficulty === 2 ? 2 : 1;
        let nbTouch = 0;
        for (let i = 0; i < game.currentTouch.length; i++) {
            nbTouch += game.currentTouch[i] ? 1 : 0;
        }
        console.log('nbTouch:', nbTouch);
        console.log('touchCount:', touchCount);
        if (nbTouch > touchCount || (game.gameFinished && !game.tresorTaken)) {
            console.log('You lost!');
            setPopupMessage('Vous avez perdu!');
            setShowPopup(true);
            setGame(prevGame => ({
                ...prevGame,
                gameFinished: true,
                gameStatus: 'lost'
            }));
            const newAudio = new Audio(lostSong);
            setAudio(newAudio);
            newAudio.play();
        } else if (game.gameFinished && game.tresorTaken) {
            console.log('You win!');
            setPopupMessage('Vous avez gagné!');
            setShowPopup(true);
            setGame(prevGame => ({
                ...prevGame,
                gameFinished: true,
                gameStatus: 'won'
            }));
            const newAudio = new Audio(winSong);
            setAudio(newAudio);
            newAudio.play();
        }
    }, [game.currentTouch, game.gameFinished]);

    return (
        <GameContext.Provider value={{ game, setGame, resetGame, gameOngoing, changeDiffulty }}>
            {children}
            {showPopup && <Popup message={popupMessage} onClose={closePopup} className={game.gameStatus}/>}
        </GameContext.Provider>
    );
};

GameProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default GameProvider;
