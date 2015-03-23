// Root namespace.
var TextyEdit = {
	classes: {}
};

TextyEdit.classes.NickManager = function() {

	this.eNickInput 		= null;
	this.sLocalStorageID 	= "nickname";

	this.lockPage = function(bFailing) {
		$('#name').attr('disabled', bFailing);
		$('#create-new').attr('disabled', bFailing);

		var fTarget = bFailing ? "show" : "hide";
		$('#modal')[fTarget]();

		fTarget = bFailing ? "addClass" : "removeClass";
		$('#texty-name-container span')[fTarget]("modal-up");
	}

	this.reportError = function(bFailing) {
		var sColour 	= bFailing ? "red" : "black";
		var fDisplay 	= bFailing ? "show" : "hide";

		$('#texty-name').css({ color: sColour });
		$('#nick-error')[fDisplay]();

		this.lockPage(bFailing);
	}

	this.init = function() {
		var sNickId = "texty-name";
		var sNameInput = "<input type='text' placeholder='Choose a nickname.' id='" + sNickId + "' />";
		
		var sNickDivId = "texty-name-container";
		var sNickDiv = "<div id='" + sNickDivId + "'></div>";
		// Add to the DOM.
		$('#container').before(sNickDiv);

		var eNickDiv = $('#' + sNickDivId);
		$(eNickDiv).append("<span>Nick:</span>");
		$(eNickDiv).append(sNameInput);

		var eNickInput = $('#' + sNickId);

		this.eNickInput = eNickInput;

		this.bindEvents();

		return this;
	}

	this.bindEvents = function() {
		// Disallowed character management.
		this.eNickInput.on('keypress', function(e) {
			// First, check for enter being pressed.
			var iEnterCharCode = 13;
			if ( e.which == iEnterCharCode ) {
				$(this).change();
				return false;
			}

			// Next, we early out if this is backspace.
			// (needed in firefox)
			var iBackspaceCharCode = 8;
			if ( e.which == iBackspaceCharCode ) {
				return true;
			}

			var rAllowRegex = /[a-zA-Z0-9_-]/;
			var sChar = String.fromCharCode(e.which);

			if ( !rAllowRegex.test(sChar) ) {
				e.preventDefault();
			}
		});

		var that = this;
		this.eNickInput.on('change', function() {
			var sNewNick = $(this).val();

			console.log("Attempting to claim '" + sNewNick + "' from server.");

			that.registerNickWithServer(sNewNick);
		});

		TextyEdit.socket.on("nick_in_use", function(data) {
			that.reportError(true);
		});

		TextyEdit.socket.on("nick_registered", function(sNick) {
			// Put the nickname in localstorage.
			localStorage[that.sLocalStorageID] = sNick;

			that.reportError(false);
		});
	}

	this.setValue = function(sValue) {
		this.eNickInput.val(sValue);
	}

	this.registerNickWithServer = function(sNick) {
		
		TextyEdit.socket.emit("register_nick", sNick);

	}

	this.getNickFromLocalStorage = function() {
		var sNick = localStorage.getItem(this.sLocalStorageID);

		return sNick;
	}
	
	return this;
};

$(document).ready(function() {
	// Initialise the socket...
	var socket 				= io.connect("http://176.31.113.194:3000");
	TextyEdit.socket 		= socket;

	// ... and the NickManager.
	var nickManager 		= new TextyEdit.classes.NickManager().init();
	TextyEdit.nickManager 	= nickManager;

	TextyEdit.socket.on("connected", function() {
		// Check for nickname in localStorage.
		var sNick = TextyEdit.nickManager.getNickFromLocalStorage();

		if ( sNick != null ) {
			TextyEdit.nickManager.setValue(sNick);

			// Ensure that we don't have a corrupted localStorage.
			TextyEdit.socket.emit("register_nick", sNick);
		}
		else {
			TextyEdit.nickManager.lockPage(true);
		}
	});
});