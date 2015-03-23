var path = require('path');

function serveIndex(res) {
	res.sendFile(path.join(__dirname, '/public', 'index.html'));
}

function serveSavedPage(inUrl, outResponse) {
	var sDir = __dirname + '/saved';
	var sFilePath = sDir + inUrl;

	fs.exists(sFilePath, function(bExists) {
		if ( bExists ) {
			outResponse.sendFile(path.join(__dirname, '/public', 'editor.html'));

			serverEmitter.emit('serving_saved_page', sFilePath, inUrl);
		}
		else {
			serveIndex(outResponse);
		}
	});
}

module.exports = function(app) {
	app.get('/', function(req, res) {
		serveIndex(res);
	});
	app.get(/^\/[a-zA-Z0-9]{6,10}$/, function(req, res) {
		var sUrl = req.url;
		serveSavedPage(sUrl, res);
	});
}
