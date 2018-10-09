import React, { Component } from 'react';

class PointButton extends Component {
    render() {
        let message = this.props.id === 'add' ? 'ADD_POINT' : 'REMOVE_POINT';
        return (
            <button id={this.props.id}  onClick={ () => this.props.onClick(message) } >{this.props.children}</button>
        );
    }
}

export default PointButton;