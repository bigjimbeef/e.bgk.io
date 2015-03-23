var ClientManager = function() {
	this.aClients 	= [];
	this.aNicks		= [];

	this.clientConnected = function(socket) {
		this.aClients.push(socket);
	};
	this.start = function() {
		var iDisconnectTime = 1000;
		var that = this;

		setInterval(function() {
			for ( var i = that.aClients.length - 1; i >= 0; --i ) {
				var oClient = that.aClients[i];

				if ( !oClient.connected ) {
					console.log("Client '" + oClient.id + "' disconnected.");
					that.aClients.splice(i, 1);
				}
			}
		}, iDisconnectTime);
	};
	this.getClients = function() {
		return this.aClients;
	};

	// Generates an IP/User-Agent for a socket, encoded in base64.
	this.generateIPUA = function(socket) {
		var sIP = socket.handshake.address;
		var sUA = socket.handshake.headers["user-agent"];

		var sIPUA 		= sIP + '#' + sUA;
		var sBase64IPUA = new Buffer(sIPUA).toString('base64');

		return sBase64IPUA;
	}

	this.checkIfNickFree = function(sNick, sIPUA) {
		var bReturn = true;

		for ( var i = 0; i < this.aNicks.length; ++i ) {
			if ( this.aNicks[i].nick == sNick ) {
				var sCurrentOwner = this.aNicks[i].ipua;

				if ( sIPUA != sCurrentOwner ) {
					bReturn = false;
					break;
				}
			}
		}

		return bReturn;
	}

	this.unbindRegisteredNicks = function(sIPUA) {
		for ( var i = this.aNicks.length - 1; i >= 0; --i ) {
			if ( this.aNicks[i].ipua == sIPUA ) {
				console.log("Freeing nick '" + this.aNicks[i].nick + "'.");

				// Remove the registered nickname.
				this.aNicks.splice(i, 1);
			}
		}
	}

	this.bindNickEvents = function(socket) {

		// Generate an IP/User-Agent string for this client.
		var sIPUA = this.generateIPUA(socket);

		var that = this;
		socket.on("register_nick", function(sNick) {

			// Clear any previously-registered nicknames for this IP/UA
			that.unbindRegisteredNicks(sIPUA);

			if ( !that.checkIfNickFree(sNick, sIPUA) ) {
				socket.emit("nick_in_use");
				return;
			}

			console.log("Registering " + sNick);

			var oNickEntry = {
				nick: sNick,
				ipua: sIPUA
			};

			// Add to the list of registered nicks.
			that.aNicks.push(oNickEntry);

			socket.emit("nick_registered", sNick)
		});

	}

	return this;
};

module.exports = ClientManager;
