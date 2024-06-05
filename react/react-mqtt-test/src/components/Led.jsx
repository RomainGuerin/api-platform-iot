import React, { useState, useEffect } from 'react';

function Led({ color }) {
    const [currentColor, setCurrentColor] = useState(color);

    useEffect(() => {
        setCurrentColor(color);
    }, [color]);

    return (
        <div>
            <h1>LED</h1>
            <p>Current color: {currentColor}</p>
            <div style={{ width: '100px', height: '100px', margin: "auto", borderRadius: "50%", backgroundColor: currentColor }}></div>
        </div>
    );
}

export default Led;
