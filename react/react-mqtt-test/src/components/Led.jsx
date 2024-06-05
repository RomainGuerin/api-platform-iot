import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Led({ color }) {
    const [currentColor, setCurrentColor] = useState(color);

    useEffect(() => {
        setCurrentColor(color);
    }, [color]);

    return (
        <div>
            <h1>LED</h1>
            <div className='led-color' style={{ backgroundColor: currentColor }}></div>
            <p>Current color: {currentColor}</p>
        </div>
    );
}

Led.propTypes = {
    color: PropTypes.string.isRequired,
};

export default Led;
