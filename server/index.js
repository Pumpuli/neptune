const http = require('http');
const Koa = require('koa');
const send = require('koa-send');
const WebSocket = require('ws');
const { nanoid } = require('nanoid');

const app = new Koa();

app.use(async (ctx) => {
	await send(ctx, ctx.path === '/' ? '/test.html' : ctx.path, { root: `${__dirname}/public` });
});

const server = http.createServer(app.callback());

const clients = [];
const rooms = [];
const ws_server = new WebSocket.Server({ server });

ws_server.on('connection', (ws) => {
	ws.on('close', (code, reason) => {
		const index = clients.findIndex((cl) => cl.socket === ws);

		if (index !== -1) {
			clients.splice(index, 1);
		}
	});

	ws.on('message', (data) => {
		console.log(`Received: ${data}`);

		const client = clients.find((cl) => cl.socket === ws);

		try {
			const msg = JSON.parse(data);

			switch (msg.type) {
				case 'connect': {
					const client = {
						id: msg.client || nanoid(16),
						socket: ws,
					};

					clients.push(client);

					ws.send(JSON.stringify({ type: 'connect', client: client.id }));

					break;
				}

				case 'create': {
					const room = {
						code: Array.from(Array(4), () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join(''),
						users: [client],
					};

					rooms.push(room);

					ws.send(JSON.stringify({ type: 'join', room: { code: room.code } }));

					break;
				}

				case 'join': {
					const room = rooms.find((r) => r.code === msg.room);

					if (!room.users.includes(client)) {
						room.users.push(client);
					}

					ws.send(JSON.stringify({ type: 'join', room: { code: room.code } }));

					break;
				}

				case 'chat': {
					const room = rooms.find((r) => r.users.includes(client));

					if (!room) {
						break;
					}

					room.users.forEach((c) => {
						c.socket.send(JSON.stringify({ type: 'chat', text: msg.text }));
					});

					break;
				}
			}
		} catch (e) {}
	});
});

server.listen(3001);
