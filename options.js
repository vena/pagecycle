function save_options()
{
	var interval = $('#interval')[0].value,
		url_entries = $('#urls_container tbody tr:not(#loading)');

	if ($.isNumeric(interval)) {
		localStorage['interval'] = interval;
	} else {
		$('#interval').css({ borderColor: 'red' });
	}

	var urls = [], urlQueries = [];
	$(url_entries).each(function() {
		var title = $(this).find('input.title')[0],
			url = $(this).find('input.url')[0],
			id = $(this).data('id');
		if ((title || url) && (title.value || url.value)) {
			urls.push([
				id || null,
				title.value,
				url.value
			]);
		}
	});
	PCDB.query(
		'INSERT OR REPLACE INTO urls (id, title, url) VALUES (?,?,?)',
		urls
	).fail(function (tx, err) {
		console.log(err);
	});
}

function restore_options()
{
	var interval = localStorage['interval'];

	$('#interval')[0].value = interval;

	PCDB.query(
		'SELECT * FROM urls'
	).done(function (urls) {
		for (var i = 0, j = urls.length; i < j; i++) {
			append_url_template(null, urls[i].title, urls[i].url, urls[i].id);
		}
	});

	$('#loading').fadeOut('fast');
}

function append_url_template(e, title, url, id)
{
	var template = $($('#url_entry_template').html()),
		container = $('#urls_container tbody');

	template = template.find('tr');
	if (id) { template.data('id', id); }
	template.find('input.title')[0].value = title || '';
	template.find('input.url')[0].value = url || '';

	template.appendTo(container).fadeIn('fast');
	
	if (e) {
		template.find('input.title')[0].focus();
	}
}

$(function() {
	restore_options();

	$('#save').on('click', save_options);

	$('.add_a_url').on('click', append_url_template);

	$('#urls_container').on('keyup', 'input', function() {
		var tr = $(this).parents('tr');
		var id = tr.data('id') || null,
			title = tr.find('input.title')[0].value,
			url = tr.find('input.url')[0].value;
		if (id) {
			PCDB.query(
				'INSERT OR REPLACE INTO urls (id, title, url) VALUES (?,?,?)',
				[
					id, title, url
				]
			);
		} else if (!tr.data('inserted')) {
			PCDB.query(
				'INSERT OR REPLACE INTO urls (id, title, url) VALUES (?,?,?)',
				[
					id, title, url
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
			PCDB.query(
				'DELETE FROM urls WHERE id=?', [ id ]
			);
		}
		tr.remove();
	});
});