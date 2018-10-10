import React, { Component, Fragment } from 'react';
import FloorPlanner from './components/FloorPlanner';
import PointsButtons from './components/PointsButtons';
import ClearFloor from './components/ClearFloor';
import CreateFloor from './components/CreateFloor';
import editor from './index';
import './css/main.css';
import { bindActionCreators } from "redux";
import { connect } from 'react-redux';
import { updateEditorUI } from './actions';

class App extends Component {

	constructor() {
		super();
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e, context) {
		switch (e) {
			case 'ADD_LAYOUT':
				this.props.updateEditorUI({
					showClearButton: true,
					showCreateFloorButton: true,
					showPointButtons: context.shape === 'C' ? true : false,
					showLayoutButtons: false
				});
				editor.createFloor({ shape: context.shape });
				break;
			case "CLEAR_LAYOUT":
				editor.clearFloor();
				this.props.updateEditorUI({
					showClearButton: true,
					showCreateFloorButton: false,
					showPointButtons: false,
					showLayoutButtons: true
				});
				break;
			case 'CREATE_FLOOR':
				editor.extrude();
				editor.clearFloor();
				this.props.updateEditorUI({
					showClearButton: false,
					showCreateFloorButton: false,
					showPointButtons: false,
					showLayoutButtons: false
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

	createEditorUI() {
		return (<Fragment key={this.props.editorUI.id}>
			<FloorPlanner showLayoutButtons={this.props.editorUI.showLayoutButtons} onClick={this.handleClick} />
			<PointsButtons showPointButtons={this.props.editorUI.showPointButtons} onClick={this.handleClick} />
			<CreateFloor showCreateFloorButton={this.props.editorUI.showCreateFloorButton} id="create-floor" onClick={this.handleClick}>Create Floor</CreateFloor>
			<ClearFloor showClearButton={this.props.editorUI.showClearButton} id="clear" onClick={this.handleClick}>X</ClearFloor>
		</Fragment>)
	}

	render() {
		return (
			<Fragment>
				<div id="editor"></div>
				{this.createEditorUI()}
			</Fragment>
		);
	}

}

function mapStateToProps(state) {
	return {
		editorUI: state.editorUI
	};
}

function matchDispatchToProps(dispatch) {
	return bindActionCreators({ updateEditorUI: updateEditorUI }, dispatch)
}


export default connect(mapStateToProps, matchDispatchToProps)(App);
