import React, { Component, Fragment } from 'react';
import FloorPlanner from './components/FloorPlanner';
import PointsButtons from './components/PointsButtons';
import ClearFloor from './components/ClearFloor';
import CreateFloor from './components/CreateFloor';
import editor from './index';
import './css/main.css';

class App extends Component {

	constructor(){
		super();
		this.handleClick = this.handleClick.bind(this);
		this.state = {
			showPointButtons		: false,
			showLayoutButtons 		: true,
			showCreateFloorButton 	: false,
			showClearButton 		: false
		}
	
	}
	
	handleClick (e, context) {
		switch (e) {
			case 'ADD_LAYOUT':
				this.setState({
					showClearButton			: true,
					showCreateFloorButton	: true,
					showPointButtons 		: context.shape === 'C' ? true : false,
					showLayoutButtons		: false 
				});
				editor.createFloor({shape: context.shape});
				break;
			case "CLEAR_LAYOUT":
				editor.clearFloor();
				this.setState({
					showClearButton			: true,
					showCreateFloorButton	: false,
					showPointButtons 		: false,
					showLayoutButtons		: true 
				});
				break;
			case 'CREATE_FLOOR':
				editor.extrude();
				editor.clearFloor();
				this.setState({
					showClearButton			: false,
					showCreateFloorButton	: false,
					showPointButtons 		: false,
					showLayoutButtons		: false 
				});
				break;
			case 'ADD_POINT':
				editor.addPoint();
				break;
			case 'REMOVE_POINT':
				editor.removePoint();
				break;
			default:
				console.log("Unknown Event Triggered");
				break;
		}
	}

	render() {
		return (
			<Fragment>
				<div id="editor"></div>
				<FloorPlanner  showLayoutButtons={ this.state.showLayoutButtons } onClick={ this.handleClick }/>
				<PointsButtons  showPointButtons={ this.state.showPointButtons } onClick={ this.handleClick }/>
				<CreateFloor showCreateFloorButton={ this.state.showCreateFloorButton } id="create-floor" onClick={ this.handleClick }>Create Floor</CreateFloor>
				<ClearFloor showClearButton={ this.state.showClearButton } id="clear" onClick={ this.handleClick }>X</ClearFloor>
			</Fragment>
		);
	}

}
	
export default App;
	