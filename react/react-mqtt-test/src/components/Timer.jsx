import { useState, useEffect, useContext } from 'react';
import Led from './Led';
import { GameContext } from '../models/GameContext';
import PropTypes from 'prop-types';
import gameMusic from '../assets/gameMusic.mp3';

function Timer({ action }) {
    const [isActive, setIsActive] = useState(false);
    const { game, setGame, resetGame } = useContext(GameContext);
    const [audio, setAudio] = useState(null);

    useEffect(() => {
        resetAudio();
    }, [game.gameFinished]);

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
        } else if (!isActive && game.gameLaunched) {
            setGame(prevGame => ({
                ...prevGame,
                gamePaused: true
            }));
            actionMessage("ON", "WHITE");
            if (audio) {
                audio.pause();
            }
        }
    }, [isActive]);

    useEffect(() => {
        let interval;
        if (isActive && game.secondsLeft > 0 && !game.gameFinished) {
            interval = setInterval(() => {
                if (game.secondsLeft === 10 || game.secondsLeft === 20) {
                    actionMessage("ON");
                }
                setGame(prevGame => ({
                    ...prevGame,
                    secondsLeft: prevGame.secondsLeft - 1
                }));
            }, 1000);
        } else if (game.secondsLeft === 0) {
            setIsActive(false);
            setGame(prevGame => ({
                ...prevGame,
                gameFinished: true,
                gamePaused: false
            }));
            resetAudio();
        }
        return () => clearInterval(interval);
    }, [isActive, game.secondsLeft]);

    const actionMessage = (status, color) => {
        let statusMessage = status ? status : isActive ? "ON" : "OFF";
        let colorMessage = color ? color : currentColor();
        setGame(prevGame => ({
            ...prevGame,
            led: { color: colorMessage, status: statusMessage }
        }));
        action(statusMessage, colorMessage);
    }

    const currentColor = () => {
        if (game.secondsLeft <= 10) {
            return "RED";
        } else if (game.secondsLeft <= 20) {
            return "BLUE";
        } else {
            return "GREEN";
        }
    };

    const updateGameStatus = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        actionMessage("OFF", "WHITE");
        if (game) {
            resetGame();
        }
        resetAudio();
    };

    const resetAudio = () => {
        if (audio) {
            audio.pause();
            setAudio(null);
        }
    }

    return (
        <div>
            <h1>Temps restant</h1>
            <h1 className={game.secondsLeft <= 10 ? 'color-red' : ''}>{game.secondsLeft}s</h1>
            <div className='button-grid'>
                {!game.gameFinished ? <button onClick={updateGameStatus}>{isActive ? 'Pause' : 'Lancer'}</button> : null}
                <button onClick={resetTimer}>Réinitialiser</button>
            </div>
            <br />
            <Led color={game.led.color} />
        </div>
    );
}

Timer.propTypes = {
    action: PropTypes.func.isRequired,
};

export default Timer;
