function save_all_options()
{
	var interval = $('#interval')[0].value,
		url_entries = $('#urls_container tbody tr:not(#loading)');

	if ($.isNumeric(interval)) {
		localStorage['interval'] = interval*1000;
	} else {
		$('#interval').css({ borderColor: 'red' });
	}

	localStorage['continue_from_last'] = $('#continue_from_last').prop('checked') ? 1 : 0;

	var urls = [];
	$(url_entries).each(function(i) {
		var title = $(this).find('input.title')[0],
			url = $(this).find('input.url')[0],
			id = $(this).data('id'),
			sort = i;
		if ((title || url) && (title.value || url.value) && url.validity.valid) {
			urls.push([
				id || null,
				sort,
				title.value,
				url.value
			]);
		}
	});
	if (urls.length) {
		PCDB.query(
			'INSERT OR REPLACE INTO urls (id, sort, title, url) VALUES (?,?,?,?)',
			urls
		).fail(function (tx, err) {
			console.log(err);
		});
	}
}

function restore_options()
{
	var interval = localStorage['interval'],
		continue_from_last = localStorage.continue_from_last;

	$('#interval')[0].value = interval/1000;
	if (continue_from_last == 1) {
		$('#continue_from_last').prop('checked', true);
	} else {
		$('#continue_from_last').prop('checked', false);
	}

	PCDB.query(
		'SELECT * FROM urls ORDER BY sort'
	).done(function (urls) {
		for (var i = 0, j = urls.length; i < j; i++) {
			append_url_template(null, urls[i]);
		}
	});

	$('#loading').fadeOut('fast');
}

function append_url_template(e, data)
{
	var template = $($('#url_entry_template').html()),
		container = $('#urls_container tbody');

	template = template.find('tr');
	if (data) {
		if (data.id) {
			template.data('id', data.id);
			if (localStorage.current_url_id && data.id == localStorage.current_url_id) {
				template.addClass('current_url');
			}
		}
		if (data.sort) { template.data('sort', data.sort); }
		template.find('input.title')[0].value = data.title || '';
		template.find('input.url')[0].value = data.url || '';
	}

	template.appendTo(container).fadeIn('fast');
	
	if (e) {
		template.find('input.title')[0].focus();
	}
}

$(function() {
	restore_options();

	$('#save').on('click', save_all_options);

	$('.add_a_url').on('click', append_url_template);

	// Save Interval setting
	$('#interval').on('keyup', function() {
		var interval = $(this)[0].value;
		if ($.isNumeric(interval)) {
			$(this).parents('.control-group').removeClass('error');
			localStorage['interval'] = interval*1000;
		} else {
			$(this).parents('.control-group').addClass('error');
		}
	});

	// Save continue from last setting
	$('#continue_from_last').on('change', function() {
		localStorage.continue_from_last = $('#continue_from_last').prop('checked') ? 1 : 0;
	});

	// Handle Sorting of URL table
	$('#urls_container tbody').sortable({
		forcePlaceholderSize: true,
		handle: '.sorthandle',
		update: function() {
			save_all_options();
		}
	});

	// Save URLs
	$('#urls_container').on('keyup', 'input', function() {
		var tr = $(this).parents('tr');
		console.log(tr.find('input.url')[0].validity);
		var id = tr.data('id') || null,
			sort = $('#urls_container tbody tr').index(tr) || 0,
			titleEl = tr.find('input.title')[0],
			title = titleEl.value,
			urlEl = tr.find('input.url')[0],
			url = urlEl.value;

		// only save if URL is valid.
		if (!url || !urlEl.validity.valid) {
			return false;
		}

		// If this is the first time saving, we need to handle insert ID
		if (id) {
			PCDB.query(
				'INSERT OR REPLACE INTO urls (id, sort, title, url) VALUES (?,?,?,?)',
				[
					id, sort, title, url
				]
			);
		} else if (!tr.data('inserted')) {
			PCDB.query(
				'INSERT OR REPLACE INTO urls (id, sort, title, url) VALUES (?,?,?,?)',
				[
					id, sort, title, url
				]
			).done(function (ret) {
				tr.data('id', ret.insertId);
			});
			tr.data('inserted', true);
		}

	});

	// Delete a URL
	$('#urls_container').on('click', '.delete', function(){
		var tr = $(this).parents('tr');
		var id = tr.data('id');
		if (id) {
			if (confirm('Are you sure you wish to delete this URL? This will be permanent!')) {
				PCDB.query(
					'DELETE FROM urls WHERE id=?', [ id ]
				);
				tr.remove();
			}
			return;
		}
		tr.remove();
	});

	// Launch Cycler starting with a given URL
	$('#urls_container').on('click', '.start_from', function() {
		var tr = $(this).parents('tr');
		var id = tr.data('id');
		if (id) {
			chrome.extension.sendMessage({
				cycle: "begin",
				start_from: id
			});
		}
	});

	// Export database
	$('#export_database').on('click', function() {
		PCDB.query('SELECT * FROM urls ORDER BY sort')
			.done(
				function (urls) {
					var data = JSON.stringify(urls);
					var bb = new Blob([data], { 'type': 'text/plain' });
					saveAs(
						bb,
						'pagecycler_database.txt'
					);
				}
			);
	});

	// Import database
	$('#import_database').on('change', '#import_database_file', function() {
		console.log('Got import file...');
		var file = $('#import_database_file')[0].files[0];
		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			function show_error(msg) {
				$('#import_database .error').remove();
				$('#import_database').append('<div class="error">' + msg + '</div>');
			}

			var data = JSON.parse(fileReader.result);
			var urls = [];
			for(var i in data) {
				if (data[i].title || data[i].url) {
					urls.push([
						data[i].id || '""',
						data[i].sort || i,
						data[i].title || '""',
						data[i].url || '""'
					]);
				}
			}

			console.log(urls);

			if (!urls.length) return show_error('No URL entries found.');
			PCDB.query(
				'CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY AUTOINCREMENT, sort INTEGER, title TEXT, url TEXT)',
				'INSERT OR REPLACE INTO urls (id, sort, title, url) VALUES (?,?,?,?)',
				urls
			)
			.done(
				function () {
					window.location.reload();
				}
			)
			.fail(
				function (tx, err) {
					return show_error(err.message);
				}
			);
		};
		fileReader.readAsText(file);
	});
	$('#import_database_button').on('click', function() {
		$('#import_database_file').click();
	});
});

chrome.extension.onMessage.addListener(
	function (request, sender, sendResponse) {
		if (request.cycle == 'update') {
			$('#urls_container tr')
				.removeClass('current_url')
				.each(function() {
					if ($(this).data('id') === request.current_id) {
						$(this).addClass('current_url');
					}
				});
		}
	}
);