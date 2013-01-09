function save_options()
{
	var interval = $('#interval')[0].value,
		url_entries = $('#urls_container tbody tr:not(#loading)');

	if ($.isNumeric(interval)) {
		localStorage['interval'] = interval;
	} else {
		$('#interval').css({ borderColor: 'red' });
	}

	var urls = [];
	$(url_entries).each(function() {
		var title = $(this).find('input.title')[0],
			url = $(this).find('input.url')[0];
		if ((title || url) && (title.value || url.value)) {
			urls.push({
				"title": title.value,
				"url": url.value
			});
		}
	});
	localStorage['urls'] = JSON.stringify(urls);
}

function restore_options()
{
	var interval = localStorage['interval'],
		urls = localStorage['urls'] ? JSON.parse(localStorage['urls']) : [];

	$('#interval')[0].value = interval;

	for (var i = 0, j = urls.length; i < j; i++) {
		append_url_template(null, urls[i].title, urls[i].url);
	}

	$('#loading').fadeOut('fast');
}

function append_url_template(e, title, url)
{
	var template = $($('#url_entry_template').html()),
		container = $('#urls_container tbody');

	template = template.find('tr');
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

	$('#urls_container').on('click', '.delete', function(){
		$(this).parents('tr').remove();
		save_options();
	});
});