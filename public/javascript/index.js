$(document).ready(function() {
	TextyEdit.socket.on('server_page_load', function(data) {
		var sRandomUrl = data.url;

		// Navigate to new page.
		window.location.replace("/" + sRandomUrl);
	});

	$('#create-new').click(function() {
		TextyEdit.socket.emit("create_new_page", "");
	});

	$('#name').keyup(function(e) {
		if ( e.keyCode == 13 ) {
			var sTarget = $(this).val();
			var rValid 	= /^[a-zA-Z0-9]{6,10}$/;

			if ( rValid.test(sTarget) ) {
				TextyEdit.socket.emit("load_old_page", sTarget);				
			}
			else {
				console.log("Invalid file name.");
			}
		}
	});
});
