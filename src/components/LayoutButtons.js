import React, { Component } from 'react';

class LayoutButtons extends Component {
    render() {
        return (
            <button id={this.props.id} shape={ this.props.shape } onClick={ () => this.props.onClick('ADD_LAYOUT', {shape: this.props.shape})} >{this.props.children}</button>
        );
    }

}

export default LayoutButtons;