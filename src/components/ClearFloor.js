import React, { Component } from 'react';
import editor from '../index';

class ClearFloor extends Component {

    constructor(){
        super();
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        editor.clearFloor();
        document.getElementsByClassName("points")[0].style.display = "none";
        document.getElementById("create-floor").style.display = "none";
    }

    render() {
        return (
            <button id={this.props.id} onClick={this.handleClick}>{this.props.children}</button>
        );
    }
}

export default ClearFloor;