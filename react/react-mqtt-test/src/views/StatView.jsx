import { useContext } from 'react';
import { GameContext } from '../models/GameContext';

const StatView = () => {
    const { game } = useContext(GameContext);

    return (
        <div>
            <h1>Stat View</h1>
            <p>Game launched: {game.gameLaunched ? 'Yes' : 'No'}</p>
            <p>Game finished: {game.gameFinished ? 'Yes' : 'No'}</p>
            <p>Difficulty: {game.difficulty}</p>
            <p>Photo resolution 0: {game.photo_res0}</p>
            <p>Photo resolution 1: {game.photo_res1}</p>
            <p>Photo resolution 2: {game.photo_res2}</p>
            <p>LED color: {game.led.color}</p>
            <p>LED status: {game.led.status}</p>
            <p>Pressure: {game.pressure}</p>
            <p>Current touch: {game.currentTouch.join(', ')}</p>
        </div>
    );
};

export default StatView;