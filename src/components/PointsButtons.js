import React, { Component } from 'react';
import PointButton from './PointButton';

class PointsButtons extends Component {
    render() {
        return (
            <div className="points">
                <PointButton id="add">+</PointButton>
                <PointButton id="remove">-</PointButton>
            </div>
        );
    }
}

export default PointsButtons;