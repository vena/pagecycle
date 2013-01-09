var cycler_window;

function open_shuffle()
{
	function open(ret) 
	{
		ret = ret[0];
		console.log('opening');
		console.log(ret);
		if (cycler_window) {
			chrome.windows.get(
				cycler_window.id,
				function(win) {
					localStorage.current_url_id = ret.id;
					win.url = ret.url;
				}
			);
		} else {
			chrome.windows.create(
				{
					url: ret.url,
					type: 'popup',
					focused: true,
					width: 800,
					height: 600
				},
				function(win) {
					localStorage.current_url_id = ret.id;
					cycler_window = win;
					open_shuffle();
				}
			);
		}
	}

	if (localStorage.current_url_id) {
		PCDB.query('SELECT * FROM urls WHERE id=?', [ localStorage.current_url_id ])
			.done(function(ret) {
				open(ret);
				setTimeout(open_shuffle, localStorage.interval);
			});
	} else {
		PCDB.query('SELECT * FROM urls ORDER BY sort LIMIT 1')
			.done(function(ret) {
				open(ret);
				setTimeout(open_shuffle, localStorage.interval);
			});
	}
}

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.cycle == 'begin') {
			open_shuffle();
		}
		if (request.cycle == 'stop') {
			stop_shuffle();
		}
	}
);