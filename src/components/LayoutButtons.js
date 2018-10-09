import React, { Component } from 'react';
import editor from '../index';

class LayoutButtons extends Component {

    constructor(){
        super();
        this.handleClick = this.handleClick.bind(this);
        
    }

    handleClick(e) {
        e.preventDefault();
        editor.createFloor({shape: this.props.shape});
        if ( this.props.shape === 'C' ) {
            document.getElementsByClassName("points")[0].style.display = "block";
            document.getElementById("create-floor").style.display = "block";
        }
        document.getElementById("create-floor").style.display = "block";
    }

    render() {
        return (
            <button id={this.props.id} onClick={this.handleClick} >{this.props.children}</button>
        );
    }
}

export default LayoutButtons;