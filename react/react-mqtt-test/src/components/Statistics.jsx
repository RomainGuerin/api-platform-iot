import React, { useContext } from 'react';
import { GameContext } from '../models/GameContext';

const Statistics = () => {
    const { game } = useContext(GameContext);

    return (
        <div className="stats-container">
            <h2>Vos Statistiques</h2>
            <div>
                <div className="stat-item">
                    <span className="stat-title">Partie terminé:</span>
                    <span className="stat-value">{game.gameFinished ? 'Oui' : 'Non'}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-title">Difficulté:</span>
                    <span className="stat-value">{game.difficulty}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-title">Laser 1 touché:</span>
                    <span className="stat-value">{game.photo_res0 < 450 ? 'Oui' : 'Non'}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-title">Laser 2 touché:</span>
                    <span className="stat-value">{game.photo_res1 < 450 ? 'Oui' : 'Non'}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-title">Laser 3 touché:</span>
                    <span className="stat-value">{game.photo_res2 < 450 ? 'Oui' : 'Non'}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-title">Trésor pris:</span>
                    <span className="stat-value">{game.tresorTaken ? 'Oui' : 'Non'}</span>
                </div>
            </div>
        </div>
    );
};

export default Statistics;