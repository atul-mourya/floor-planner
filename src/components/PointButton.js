import React, { Component } from 'react';
import editor from '../index';

class PointButton extends Component {

    constructor(){
        super();
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        if ( this.props.id === 'add' ) editor.addPoint();
        if ( this.props.id === 'remove' ) editor.removePoint();
    }

    render() {
        return (
            <button id={this.props.id} onClick={this.handleClick} >{this.props.children}</button>
        );
    }
}

export default PointButton;