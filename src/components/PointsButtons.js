import React, { Component } from 'react';
import PointButton from './PointButton';

class PointsButtons extends Component {

    render() {
        const isVisible = this.props.showPointButtons;
        let buttons;
        if (isVisible) {
            buttons = (
                <div className="points">
                    <PointButton id="add" onClick={this.props.onClick}>+</PointButton>
                    <PointButton id="remove" onClick={this.props.onClick}>-</PointButton>
                </div>
            )
        } else {
            buttons = <div/>
        }
        return  buttons;
        
    }
}

export default PointsButtons;