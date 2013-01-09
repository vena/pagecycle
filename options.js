function save_options()
{
	var intervalEl = document.getElementById('interval'),
		urls_container = document.getElementById('urls_container');

	// Make sure interval is a number
	if (!intervalEl.value || !/^\d+$/.test(intervalEl.value)) {
		intervalEl.style.borderColor = 'red';
	} else {
		localStorage['interval'] = interval.value;
	}

	// save each url entry
	var url_entries = urls_container.getElementsByClassName('url_entry'),
		urls = [];
	for (var i = 0, j = url_entries.length; i < j; i++) {
		var url_entry = url_entries[i];
		var title = url_entry.querySelector('.title input'),
			url = url_entry.querySelector('.url input');
		if ((title || url) && (title.value || url.value)) {
			urls.push({
				"title": title.value || "",
				"url": url.value || ""
			});
		}
	}
	localStorage['urls'] = JSON.stringify(urls);

}

function restore_options()
{
	var intervalEl = document.getElementById('interval'),
		interval = localStorage['interval'],
		urls_container = document.getElementById('urls_container'),
		urls = localStorage['urls'] ? JSON.parse(localStorage['urls']) : [],
		template, i, j;

	intervalEl.value = interval || 3600;

	for (i = 0, j = urls.length; i < j; i++) {
		append_url_template(urls[i].title, urls[i].url);
	}

	var add_url_buttons = document.getElementsByClassName('add_a_url');
	for(i = 0, j = add_url_buttons.length; i < j; i++) {
		add_url_buttons[i].addEventListener('click', append_url_template);
	}

	document.getElementById('loading').style.display = 'none';
}

function append_url_template(t, u)
{
	var template = document.querySelector('.url_entry.template').cloneNode(1),
		container = document.getElementById('urls_container');

	template.querySelector('.title input').value = typeof t != 'object' ? t : '';
	template.querySelector('.url input').value = u || '';

	template.className = template.className.replace(/template/, '');
	container.appendChild(template);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
