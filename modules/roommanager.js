var RoomManager = function() {
	this.rooms = {};

	this.joinClientToRoom = function(socket, sNick, sPageName) {
		this.removeClientFromRooms(socket, sNick);

		socket.join(sPageName);

		if ( this.rooms[sPageName] == undefined ) {
			this.rooms[sPageName] = [];
		}
		this.rooms[sPageName].push(sNick);

		this.printRoomsForClient(sNick);
	}

	this.removeClientFromRooms = function(socket, sNick) {
		for ( var sRoomName in this.rooms ) {
			var aClients = this.rooms[sRoomName];

			var iIdx = aClients.indexOf(sNick);
			if ( iIdx < 0 ) {
				continue;
			}

			socket.leave(sRoomName);

			this.rooms[sRoomName].splice(iIdx, 1);
		}
	}

	this.printRoomsForClient = function(sNick) {
		console.log(sNick + " is connected to:");

		for ( var sRoomName in this.rooms ) {
			var aClients = this.rooms[sRoomName];

			if ( aClients.indexOf(sNick) >= 0 ) {
				console.log(sRoomName);
			}
		}
	}
};

module.exports = RoomManager;