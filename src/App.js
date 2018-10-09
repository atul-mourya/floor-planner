import React, { Component, Fragment } from 'react';
import FloorPlanner from './components/FloorPlanner';
import PointsButtons from './components/PointsButtons';
import ClearFloor from './components/ClearFloor';
import CreateFloor from './components/CreateFloor';
import './css/main.css';

class App extends Component {

	render() {
		return (
			<Fragment>
				<div id="editor"></div>
				<FloorPlanner />
				<PointsButtons />
				<CreateFloor id="create-floor">Create Floor</CreateFloor>
				<ClearFloor id="clear" >X</ClearFloor>
			</Fragment>
		);
	}

}
	
export default App;
	