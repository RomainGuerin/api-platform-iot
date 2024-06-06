import { useState, useEffect, useContext } from 'react';
import Led from './Led';
import { GameContext } from '../models/GameContext';
import PropTypes from 'prop-types';
import gameMusic from '../assets/gameMusic.mp3';

function Timer({ action }) {
    const [seconds, setSeconds] = useState(5);
    const [isActive, setIsActive] = useState(false);
    const { game, setGame, resetGame } = useContext(GameContext);
    const [audio, setAudio] = useState(null);

    useEffect(() => {
        let interval;
        if (isActive && seconds > 0 && !game.gameFinished) {
            interval = setInterval(() => {
                if (seconds === 10 || seconds === 20) {
                    actionMessage("ON");
                }
                setSeconds(seconds => seconds - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
            actionMessage("OFF", "WHITE");
            setGame(prevGame => ({
                ...prevGame,
                gameFinished: true,
                gamePaused: false
            }));
            if (audio) {
                audio.pause();
                setAudio(null);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    useEffect(() => {
        if (isActive) {
            setGame(prevGame => ({
                ...prevGame,
                gameLaunched: true,
                gamePaused: false
            }));
            actionMessage("ON");
            if (!audio) {
                const newAudio = new Audio(gameMusic);
                newAudio.volume = 0.5;
                setAudio(newAudio);
                newAudio.play();
            } else if (audio.paused) {
                audio.play();
            }
        } else if (!isActive && seconds !== 30) {
            setGame(prevGame => ({
                ...prevGame,
                gamePaused: true
            }));
            actionMessage("ON");
            if (audio) {
                audio.pause();
            }
        }
    }, [isActive]);

    const actionMessage = (status, color) => {
        let statusMessage = status ? status : isActive ? "ON" : "OFF";
        let colorMessage = color ? color : currentColor();
        return action(statusMessage + "," + colorMessage);
    }

    const currentColor = () => {
        if (!isActive && !game.gameFinished) {
            return "WHITE";
        }
        console.log(!isActive, game.gameFinished, game.gameStatus, game.gameStatus == 'won');
        if (!isActive && game.gameFinished && game.gameStatus == 'won') {
            return "GREEN";
        }
        if (!isActive && game.gameFinished && game.gameStatus == 'lost') {
            return "RED";
        }
        if (seconds <= 10) {
            return "RED";
        } else if (seconds <= 20) {
            return "BLUE";
        } else {
            return "GREEN";
        }
    };

    const invertTimerStatus = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setSeconds(30);
        actionMessage("OFF", "WHITE");
        if (game) {
            resetGame();
        }
        if (audio) {
            audio.pause();
            setAudio(null);
        }
    };

    return (
        <div>
            <h1>Temps restant</h1>
            <h1 className={seconds <= 10 ? 'color-red' : ''}>{seconds}s</h1>
            <div className='button-grid'>
                <button onClick={invertTimerStatus}>{isActive ? 'Pause' : 'Lancer'}</button>
                <button onClick={resetTimer}>Réinitialiser</button>
            </div>
            <br />
            <Led color={currentColor().toString()} />
        </div>
    );
}

Timer.propTypes = {
    action: PropTypes.func.isRequired,
};

export default Timer;
