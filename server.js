// Base server components.
var express = require("express");
var app 	= express();
require('./router')(app);
var path 	= require('path');
var server 	= require('http').Server(app);

// Modular components.
var TextyEditServer = {
	clientmanager: require('./modules/clientmanager')(),
	roommanager: require('./modules/roommanager')()
};

// Event binding prototypes.
var IndexServer			= require('./modules/indexserver');

// Initialise the directory structure for serving css/js.
app.use("/styles", express.static(__dirname + '/public/stylesheets'));
app.use("/scripts", express.static(__dirname + '/public/javascript'));

var io 			= require('socket.io')(server);
var events 		= require('events');
// Server globals.
serverEmitter 	= new events.EventEmitter();
fs 				= require('fs');

var iPort = 3000;
server.listen(iPort, function() {
	console.log("Starting the server, listening on port " + iPort + ".");

	TextyEditServer.clientmanager.start();
});

// Server data.
var oPageData 	= {};


// COMMON EVENTS - Used from all pages.
//
var bindCommonEvents = function(socket) {

	TextyEditServer.clientmanager.bindNickEvents(socket);

}

// EDITOR EVENTS - Used when on a text editor page.
//
var bindEditorEvents = function(socket) {

	// TODO:

}

io.sockets.on('connection', function(socket) {
	console.log("Client connected (ID " + socket.id + ").");

	// Inform the client of the connection.
	socket.emit('connected');
	// Inform the ClientManager of the connection.
	TextyEditServer.clientmanager.clientConnected(socket);

	// Initial data.
	/*
	var sReferrer = socket.handshake.headers.referer;
	if ( sReferrer == undefined ) {
		return;
	}

	sReferrer = sReferrer.replace('http://', '');

	var aMatches = sReferrer.match(/\/[a-zA-Z0-9]{6,10}$/);

	if ( aMatches == null ) {
		return;
	}

	var sPageName = aMatches[0];
	console.log(sPageName, oPageData);

	if ( oPageData[sPageName] == undefined ) {
		return;
	}

	socket.emit("server_initial_data", oPageData[sPageName]);
	*/

	bindCommonEvents(socket);

	// Using the index-server module.
	new IndexServer(socket);

	bindEditorEvents(socket);
});

serverEmitter.on('serving_saved_page', function(sFilePath, sUrl) {

	console.log("Loading saved page : " + sUrl);

	fs.readFile(sFilePath, "utf-8", function(err, data) {

		console.log("File read output: ", err, data);

		var aMatches = sFilePath.match(/\/[a-zA-Z0-9]{6,10}$/);
		var sUrlPart = aMatches[0];

		oPageData[sUrlPart] = data;
	});

	/*
	// Need to evaluate structure again. Sigh.

	TextyEditServer.roommanager.joinClientToRoom(sUrl);

	TextyEditServer.
	TextyEditServer.roommanager.printRoomsForClient()
	*/
});
