import { useState, useEffect, useContext } from 'react';
import Led from './Led';
import { GameContext } from '../models/GameContext';
import PropTypes from 'prop-types';

function Timer({ action }) {
    const [seconds, setSeconds] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const { game, setGame, resetGame } = useContext(GameContext);

    useEffect(() => {
        let interval;
        if (isActive && seconds > 0) {
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
                gameFinished: true
            }));
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    useEffect(() => {
        if (isActive) {
            setGame(prevGame => ({
                ...prevGame,
                gameLaunched: true
            }));
            actionMessage("ON");
        } else if (!isActive && seconds !== 30) {
            setGame(prevGame => ({
                ...prevGame,
                gameLaunched: false
            }));
            actionMessage("BREAK");
        }
    }, [isActive]);

    const actionMessage = (status, color) => {
        let statusMessage = status ? status : isActive ? "ON" : "OFF";
        let colorMessage = color ? color : currentColor();
        return action(statusMessage + "," + colorMessage);
    }

    const currentColor = () => {
        if (!isActive) {
            return "WHITE";
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
    };

    return (
        <div>
            <h1>Timer</h1>
            <h1>{seconds}s</h1>
            <div className='button-grid'>
                <button onClick={invertTimerStatus}>{isActive ? 'Break' : 'Start'}</button>
                <button onClick={resetTimer}>Reset</button>
            </div>
            <br />
            <hr />
            {/* gérer différemment l'affichage de led */}
            <Led color={currentColor().toString()} />
        </div>
    );
}

Timer.propTypes = {
    action: PropTypes.func.isRequired,
};

export default Timer;
