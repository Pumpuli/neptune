import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
	function roomAlert() {
		alert("In the future this button will create a new room. \nBut not today.")
	}

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<button onClick={roomAlert}>Create new room</button>
				<a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
					Learn React
				</a>
			</header>
		</div>
	);
}

export default App;
