import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Led({ color, status }) {
    const [currentColor, setCurrentColor] = useState(color);

    useEffect(() => {
        setCurrentColor(color);
    }, [color]);

    return (
        <div>
            <div className='led-color' style={{ backgroundColor: status === "ON" ? currentColor : "transparent", boxShadow: "0 0 10px 0 " + currentColor }}></div>
        </div>
    );
}

Led.propTypes = {
    color: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
};

export default Led;
