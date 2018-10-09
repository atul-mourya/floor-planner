import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import LoadingManager from './js/spacekraft/LoadingManager';
import SKEditor from  './js/spacekraft/editor';

ReactDOM.render(<App />, document.getElementById('root'));
serviceWorker.unregister();

const loadingManager = new LoadingManager();
const container = document.getElementById('editor');

const data = {
    container: container,
    cdn: ''
};

const onReady = function () {
    console.log('editor loaded');
};

const editor = new SKEditor(data, loadingManager, onReady);
editor.initSceneSetup();

export default editor;