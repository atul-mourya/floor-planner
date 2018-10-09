import React, { Component } from 'react';

class ClearFloor extends Component {

    render() {
        const isVisible = this.props.showClearButton;
        let buttons;
        if (isVisible) {
            buttons = <button id={this.props.id} onClick={() => this.props.onClick('CLEAR_LAYOUT')}>{this.props.children}</button>
        } else {
            buttons = <div/>
        }
        return  buttons;
    }
}

export default ClearFloor;