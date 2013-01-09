function save_all_options()
{
	var interval = $('#interval')[0].value,
		url_entries = $('#urls_container tbody tr:not(#loading)');

	if ($.isNumeric(interval)) {
		localStorage['interval'] = interval*1000;
	} else {
		$('#interval').css({ borderColor: 'red' });
	}

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
	var interval = localStorage['interval'];

	$('#interval')[0].value = interval/1000;

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
		if (data.id) { template.data('id', data.id); }
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

	$('#interval').on('keyup', function() {
		var interval = $(this)[0].value;
		if ($.isNumeric(interval)) {
			$(this).parents('.control-group').removeClass('error');
			localStorage['interval'] = interval*1000;
		} else {
			$(this).parents('.control-group').addClass('error');
		}
	});

	$('#urls_container tbody').sortable({
		forcePlaceholderSize: true,
		handle: '.sorthandle',
		update: function() {
			save_all_options();
		}
	});

	$('#urls_container').on('keyup', 'input', function() {
		var tr = $(this).parents('tr');
		console.log(tr.find('input.url')[0].validity);
		var id = tr.data('id') || null,
			sort = $('#urls_container').index(tr) || 0,
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
});