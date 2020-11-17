import React, { useRef, FormEvent, useState, useLayoutEffect } from 'react';
import './App.css';
import useWebSocket from './useWebSocket';

function App() {
	const [isConnected, setIsConnected] = useState(false);
	const [currentRoom, setCurrentRoom] = useState<string | null>(null);
	const [chatMessages, setChatMessages] = useState<string[]>([]);

	const roomCodeInputRef = useRef<HTMLInputElement>(null);
	const chatMessagesRef = useRef<HTMLDivElement>(null);
	const chatInputRef = useRef<HTMLInputElement>(null);

	useLayoutEffect(() => {
		const { current: div } = chatMessagesRef;

		if (div) {
			div.scrollTop = div.scrollHeight;
		}
	});

	const { sendMessage } = useWebSocket(`ws://${window.location.hostname}:3001/`, {
		onOpen() {
			sendMessage(JSON.stringify({ type: 'connect' }));
		},
		onMessage(data) {
			console.log(data);

			const message = JSON.parse(data);

			switch (message.type) {
				case 'connect':
					setIsConnected(true);
					break;
				case 'join':
					setCurrentRoom(message.room.code);
					break;
				case 'chat':
					setChatMessages((prev) => prev.concat([message.text]));
					break;
			}
		},
	});

	function handleCreateRoomRequest() {
		sendMessage(JSON.stringify({ type: 'create' }));
	}

	function handleRoomJoinRequest(event: FormEvent) {
		event.preventDefault();

		const code = roomCodeInputRef.current?.value;

		if (!code) {
			return;
		}

		sendMessage(JSON.stringify({ type: 'join', room: code }));
	}

	function handleChatSend(event: FormEvent) {
		event.preventDefault();

		const text = chatInputRef.current?.value;

		if (!text) {
			return;
		}

		sendMessage(JSON.stringify({ type: 'chat', text }));
		chatInputRef.current!.value = '';
	}

	return (
		<div className="App">
			<button type="button" disabled={!isConnected} onClick={handleCreateRoomRequest}>
				Create room
			</button>
			<form onSubmit={(event) => handleRoomJoinRequest(event)}>
				<input ref={roomCodeInputRef} type="text" maxLength={4} placeholder="Room code" disabled={!isConnected} />
				<button type="submit" disabled={!isConnected}>
					Join room
				</button>
			</form>
			<p>Currently in room: {currentRoom}</p>
			<div style={{ height: '10rem', display: 'flex', flexDirection: 'column' }}>
				<div
					ref={chatMessagesRef}
					style={{ whiteSpace: 'pre', flexGrow: 1, backgroundColor: '#eee', overflowX: 'hidden', overflowY: 'scroll' }}
				>
					{chatMessages.map((msg, i) => (
						<div key={i}>{msg}</div>
					))}
				</div>
				<form onSubmit={(event) => handleChatSend(event)}>
					<input ref={chatInputRef} type="text" maxLength={256} disabled={!currentRoom} />
					<button type="submit" disabled={!currentRoom}>Chat</button>
				</form>
			</div>
		</div>
	);
}

export default App;
