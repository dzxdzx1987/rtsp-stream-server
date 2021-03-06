
var WebSocket = require('ws');
var http = require('http');
var STREAM_PORT = 8081;
var WEBSOCKET_PORT = 8082;

var startService = function () {
	// Websocket Server
	var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
	socketServer.connectionCount = 0;
	socketServer.on('connection', function(socket, upgradeReq) {
		socketServer.connectionCount++;
		console.log(
			'New WebSocket Connection: ',
			(upgradeReq || socket.upgradeReq).socket.remoteAddress,
			(upgradeReq || socket.upgradeReq).headers['user-agent'],
			'('+socketServer.connectionCount+' total)'
		);
		socket.on('close', function(code, message){
			socketServer.connectionCount--;
			console.log(
				'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
			);
		});
	});
	socketServer.broadcast = function(data) {
		socketServer.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
	};

	// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
	var streamServer = http.createServer( function(request, response) {
		var params = request.url.substr(1).split('/');

		if (params[0] !== "stream") {
			console.log(
				'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
				request.socket.remotePort + ' - wrong secret.'
			);
			response.end();
		}

		response.connection.setTimeout(0);
		console.log(
			'Stream Connected: ' +
			request.socket.remoteAddress + ':' +
			request.socket.remotePort
		);
		request.on('data', function(data){
			socketServer.broadcast(data);
			if (request.socket.recording) {
				request.socket.recording.write(data);
			}
		});
		request.on('end',function(){
			console.log('close');
			if (request.socket.recording) {
				request.socket.recording.close();
			}
		});
	});
	// Keep the socket open for streaming
	streamServer.headersTimeout = 0;
	streamServer.listen(STREAM_PORT);

	console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
	console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>');
}

module.exports = startService;