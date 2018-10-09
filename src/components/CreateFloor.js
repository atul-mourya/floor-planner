import React, { Component } from 'react';

class CreateFloor extends Component {

    render() {
        const isVisible = this.props.showCreateFloorButton;
        let buttons;
        if (isVisible) {
            buttons = <button id={this.props.id} onClick={ () => this.props.onClick('CREATE_FLOOR') }>{this.props.children}</button>
        } else {
            buttons = <div/>
        }
        return  buttons;
    }
}

export default CreateFloor;