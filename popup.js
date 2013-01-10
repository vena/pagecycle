$('#start_cycler').click(function () {
	chrome.extension.sendMessage({ cycle: "begin" });
});