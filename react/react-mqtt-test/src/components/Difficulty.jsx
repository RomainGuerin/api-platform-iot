import { useContext } from 'react';
import { GameContext } from '../models/GameContext';
import Button from '../components/Button';

function Difficulty() {
    const { game, changeDiffulty } = useContext(GameContext);

    const selectedDifficulty = (difficulty, gameDifficulty) => {
        if (difficulty === gameDifficulty) {
            return 'difficulte-selected';
        } else {
            return 'difficulte-not-selected';
        }
    }

    return (
        <div>
            <div className='button-grid'>
                <Button onClick={() => changeDiffulty(1)} className={selectedDifficulty(1, game.difficulty)}>Difficulté 1</Button>
                <Button onClick={() => changeDiffulty(2)} className={selectedDifficulty(2, game.difficulty)}>Difficulté 2</Button>
                <Button onClick={() => changeDiffulty(3)} className={selectedDifficulty(3, game.difficulty)}>Difficulté 3</Button>
            </div>
        </div>
    );
}

export default Difficulty;
