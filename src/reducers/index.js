import { combineReducers } from "redux";
import EditorUIReducer from './EditorUI';

const allReducers = combineReducers({
    editorUI: EditorUIReducer
});

export default allReducers;
