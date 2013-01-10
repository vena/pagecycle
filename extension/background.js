var cycler_window_id;

function open_shuffle(start_from)
{
	function update_win()
	{
		chrome.extension.sendMessage({
			cycle: "select",
			id: start_from
		});
	}

	function create_win()
	{
		chrome.windows.create(
			{
				url: "cycler.html?start_from=" + start_from,
				width: 800,
				height: 600,
				type: 'popup'
			},
			function (win) {
				cycler_window_id = win.id;
			}
		);
	}

	console.log(cycler_window_id);

	chrome.windows.getAll({}, function (window_list) {
		if (cycler_window_id) {
			for (var w in window_list) {
				if (window_list[w].id == cycler_window_id) {
					update_win();
					return;
				}
			}
		}
		create_win();
	});

}

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(request);
		if (request.cycle) {
			switch(request.cycle) {
				case 'begin':
					var start_from = request.start_from || undefined;
					open_shuffle(start_from);
					break;
				case 'stop':
					stop_shuffle();
					break;
				case 'update':
					localStorage.current_url_id = request.current_id || undefined;
					break;
			}
		}
	}
);