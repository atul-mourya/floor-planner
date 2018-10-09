import React, { Component } from 'react';
import LayoutButtons from './LayoutButtons';

class FloorPlanner extends Component {
    render() {
        const isVisible = this.props.showLayoutButtons;
        let buttons;
        if (isVisible) {
            buttons = (
                <div id="floor-planner">
                    <LayoutButtons id="box-layout" shape="Box" onClick={ this.props.onClick }>B</LayoutButtons>
                    <LayoutButtons id="t-layout" shape="T" onClick={ this.props.onClick }>T</LayoutButtons>
                    <LayoutButtons id="l-layout" shape="L" onClick={ this.props.onClick }>L</LayoutButtons>
                    <LayoutButtons id="u-layout" shape="U" onClick={ this.props.onClick }>U</LayoutButtons>
                    <LayoutButtons id="c-layout" shape="C" onClick={ this.props.onClick }>C</LayoutButtons>
                </div>
            )
        } else {
            buttons = <div/>
        }
        return  buttons;
    }
}

export default FloorPlanner;