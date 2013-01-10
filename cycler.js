var cycler_window,
	timer;

function open_shuffle(options)
{

	reset_timer();

	if (options) {

		// Start from a specified URL ID
		if (options.hasOwnProperty('start_from')) {
			console.log('Loading URL at specified ID...');
			PCDB.query('SELECT * FROM urls WHERE id=?', [options.start_from])
				.done(
					function (url) {
						if (!url.length) return open_shuffle();
						set_cycle_frame(url[0]);
					}
				)
				.fail(
					function (tx, err) { show_error(err.message); }
				);
			return;
		}

		// Start from URL sorted before specified URL ID
		if (options.hasOwnProperty('start_before')) {
			console.log('Loading URL before specified ID...');
			PCDB.query('SELECT * FROM urls WHERE id=?', [options.start_before])
				.done(
					function (start_url) {
						if (!start_url.length) return open_shuffle();
						if (start_url[0].sort === 0) return open_shuffle();
						PCDB.query('SELECT * FROM urls WHERE sort < ? ORDER BY sort', [start_url[0].sort])
							.done(
								function (url) {
									if (!url.length) return open_shuffle();
									set_cycle_frame(url[0]);
								}
							)
							.fail(
								function (tx, err) { show_error(err.message); }
							);
					}
				)
				.fail(
					function (tx, err) { show_error(err.message); }
				);
			return;
		}

		// Start from a URL sorted after specified URL ID
		if (options.hasOwnProperty('start_after')) {
			console.log('Loading URL after specified ID...');
			PCDB.query('SELECT * FROM urls WHERE id=?', [options.start_after])
				.done(
					function (start_url) {
						if (!start_url.length) return open_shuffle();
						PCDB.query('SELECT * FROM urls WHERE sort > ? ORDER BY sort', [start_url[0].sort])
							.done(
								function (url) {
									if (!url.length) {
										localStorage.removeItem('current_url_id');
										return open_shuffle();
									}
									set_cycle_frame(url[0]);
								}
							)
							.fail(
								function (tx, err) { show_error(err.message); }
							);
					}
				)
				.fail(
					function (tx, err) { show_error(err.message); }
				);
			return;
		}

	} else {

		// Loading generically

		// Should we pick up where we left off?
		if (localStorage.continue_from_last == 1 && localStorage.current_url_id) {
			console.log('Loading from where we last left off...');
			return open_shuffle({ start_from: localStorage.current_url_id });
		}

		// Load the first in the list
		console.log('Loading the first URL in the list...');
		PCDB.query('SELECT * FROM urls ORDER BY sort LIMIT 1')
			.done(
				function (url) {
					if (!url.length) return show_error('No URLs have been created yet!');
					set_cycle_frame(url[0]);
				}
			)
			.fail(
				function (tx, err) { show_error(err.message); }
			);
		return;

	}

}

function stop_timer()
{
	$('#progress_bar').stop();
}

function reset_timer()
{
	$('#progress_bar').stop(true).width(0);
}

function start_timer(do_not_reset)
{
	$('#progress_bar').stop(true);
	if (!do_not_reset) {
		$('#progress_bar').width(0);
	}
	$('#progress_bar').animate(
		{ width: '100%'},
		{
			duration: parseInt(localStorage.interval, 10),
			easing: 'linear',
			complete: next
		}
	);
}

function next()
{
	open_shuffle({ start_after: localStorage.current_url_id });
}

function set_cycle_frame(url)
{
	$('#cycleframe').attr('src', url.url);
	$('#cycleframe').on('load', start_timer);
	$('#current_title').html(url.title);
	chrome.extension.sendMessage({ cycle: 'update', current_id: url.id });
	//start_timer();
}

function show_error(msg)
{
	$('#error_message').remove();
	$('<div id="error_message" />').html(msg).fadeIn('fast').appendTo('body');
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

$(function() {
	var urlvars = getUrlVars();
	if (urlvars.start_from) {
		open_shuffle({ start_from: urlvars.start_from });
		return;
	}
	open_shuffle();

});

$('#go_previous').on('click', function() {
	console.log('clicked previous');
	chrome.extension.sendMessage({
		cycle: 'previous'
	});
});
$('#go_next').click(function() {
	chrome.extension.sendMessage({
		cycle: 'next'
	});
});
$('#go_playpause').click(function() {
	if ($('#progress_bar').is(':animated')) {
		stop_timer();
		$('#go_playpause i').removeClass().addClass('icon-play');
	} else {
		start_timer(1);
		$('#go_playpause i').removeClass().addClass('icon-pause');
	}
});

chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.cycle) {
			switch (request.cycle) {
				case 'next':
					if (localStorage.current_url_id) {
						open_shuffle({ start_after: localStorage.current_url_id });
						break;
					}
					open_shuffle();
					break;
				case 'previous':
					if (localStorage.current_url_id) {
						open_shuffle({ start_before: localStorage.current_url_id });
						break;
					}
					open_shuffle();
					break;
				case 'select':
					var id = request.id || undefined;
					open_shuffle({ start_from: id });
					break;
				case 'stop':
					stop_timer();
					break;
			}
		}
	}
);