
$(document).ready(function() {

	TextyEdit.socket.on('server_initial_data', function(data) {
		$('textarea').val(data);
	});

});
