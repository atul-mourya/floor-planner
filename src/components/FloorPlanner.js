import React, { Component } from 'react';
import LayoutButtons from './LayoutButtons';

class FloorPlanner extends Component {
    render() {
        return (
            <div id="floor-planner">
                <LayoutButtons id="box-layout" shape="Box">B</LayoutButtons>
                <LayoutButtons id="t-layout" shape="T">T</LayoutButtons>
                <LayoutButtons id="l-layout" shape="L">L</LayoutButtons>
                <LayoutButtons id="u-layout" shape="U">U</LayoutButtons>
                <LayoutButtons id="c-layout" shape="C">C</LayoutButtons>
            </div>
        );
    }
}

export default FloorPlanner;