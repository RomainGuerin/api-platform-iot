import { useEffect, createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const GameContext = createContext();

const GameProvider = ({ children }) => {
    const [game, setGame] = useState({
        gameLaunched: false,
        gameFinished: false,
        difficulty: 1,
        photo_res0: 1200,
        photo_res1: 1200,
        photo_res2: 1200,
        led: { color: 'WHITE', status: 'OFF' },
        pressure: 1200,
        currentTouch: [false, false, false, false],
    });

    const resetGame = () => {
        console.log('Resetting game');
        setGame({
            gameLaunched: false,
            gameFinished: false,
            difficulty: 1,
            photo_res0: 1200,
            photo_res1: 1200,
            photo_res2: 1200,
            led: { color: 'WHITE', status: 'OFF' },
            pressure: 1200,
            currentTouch: [false, false, false, false],
        });
    }

    useEffect(() => {
        console.log('Game updated currentTouch:', game.currentTouch);
        let touchCount = game.difficulty === 1 ? 2 : game.difficulty === 2 ? 1 : 0;
        let nbTouch = 0;
        for (let i = 0; i < game.currentTouch.length; i++) {
            nbTouch += game.currentTouch[i] ? 1 : 0;
        }
        console.log('nbTouch:', nbTouch);
        console.log('touchCount:', touchCount);
        if (nbTouch > touchCount) {
            console.log('You lost!');
        } else if (game.gameFinished && nbTouch < touchCount) {
            console.log('You win!');
        }
    }, [game.currentTouch, game.gameFinished]);

    return (
        <GameContext.Provider value={{ game, setGame, resetGame }}>
            {children}
        </GameContext.Provider>
    );
};

GameProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default GameProvider;
