//
// INDEX EVENTS - Used whilst on the root index page.
//
var path = require('path');
var iPageLength = 10;

var generateRandomPageName = function(iLength) {
	var sPossible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	var aOutput = [];
	for ( var i = 0; i < iLength; ++i ) {
		var iRandomIdx = Math.floor(Math.random() * sPossible.length);
		aOutput.push(sPossible.charAt(iRandomIdx));
	}

	var sOutput = aOutput.join("");

	return sOutput;
}

var constructFilePath = function(sFileName) {
	return path.join(__dirname, '../saved', sFileName);
}

var bindIndexEvents = function(socket) {
	socket.on("create_new_page", function() {

		console.log("User " + socket.id + " requested new page.");

		var sNewFileName 	= null;

		while ( sNewFileName == null ) {
			var sNewPageName 	= generateRandomPageName(iPageLength);
			var sFilePath 		= constructFilePath(sNewPageName);

			try {
				var fd = fs.openSync(sFilePath, 'r');

				fs.closeSync(fd);
			}
			catch (err) {
				// The file does not exist, thus the file name is ok.
				sNewFileName = sNewPageName;
			}
		}

		var sFilePath = constructFilePath(sNewFileName);

		// File does not exist, so create the new file.
		fs.writeFile(sFilePath, "", function(err) {
		    if(err) {
		        console.log(err);
		    } 
		    else {
				console.log("Creating new page with name '" + sNewPageName +"'");

				socket.emit("server_page_load", { url : sNewFileName });
		    }
		});
	});

	socket.on("load_old_page", function(sPageName) {
		try {
			var sFilePath = constructFilePath(sPageName);
			var fd = fs.openSync(sFilePath, 'r');

			fs.closeSync(fd);

			socket.emit("server_page_load", { url : sPageName });
		}
		catch (err) {
			// The file does not exist.
			console.log("User " + socket.id + " attempting to load a page which doesn't exist (" + sPageName + ")");
		}
	});
}

module.exports = bindIndexEvents;