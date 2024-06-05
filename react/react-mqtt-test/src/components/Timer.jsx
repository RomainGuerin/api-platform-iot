import React, { useState, useEffect } from 'react';
import Led from './Led';

function Timer({ action }) {
    const [seconds, setSeconds] = useState(30);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                if (seconds === 10 || seconds === 20) {
                    action("ON,"+currentColor());
                }
                setSeconds(seconds => seconds - 1);
                if (seconds === 1) {
                    reset();
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    useEffect(() => {
        if (isActive && action instanceof Function) {
            action(`ON,${currentColor()}`);
        } else {
            action(`PAUSE,${currentColor()}`);
        }
    }, [isActive]);

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

    const toggle = () => {
        setIsActive(prevIsActive => !prevIsActive);
    };

    const reset = () => {
        setIsActive(false);
        setSeconds(30);
        action("OFF,"+currentColor());
    };

    return (
        <div>
            <h1>Timer: {seconds}s</h1>
            <button onClick={toggle}>{isActive ? 'Pause' : 'Start'}</button>
            <button onClick={reset}>Reset</button>
            <Led color={currentColor()} />
        </div>
    );
}

export default Timer;
