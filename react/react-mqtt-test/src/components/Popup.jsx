import React from 'react';
import PropTypes from 'prop-types';
import Statistics from '../components/Statistics';

const Popup = ({ message, className, onClose }) => {
    return (
        <div className='popup'>
            <h2 className={'game-' + className}>{message}</h2>
            <Statistics />
            <button onClick={onClose}>Fermer</button>
        </div>
    );
};

Popup.propTypes = {
    message: PropTypes.string.isRequired,
    className: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default Popup;