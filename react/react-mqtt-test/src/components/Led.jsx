import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Led({ color }) {
    const [currentColor, setCurrentColor] = useState(color);

    useEffect(() => {
        setCurrentColor(color);
    }, [color]);

    return (
        <div>
            <div className='led-color' style={{ backgroundColor: currentColor, boxShadow: "0 0 10px 0 " + currentColor }}></div>
            <small><i>{currentColor}</i></small>
        </div>
    );
}

Led.propTypes = {
    color: PropTypes.string.isRequired,
};

export default Led;
