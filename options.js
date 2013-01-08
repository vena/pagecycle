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
	var url_entries = urls_container.getElementsByClassName('url_entry');
	for (var i = 0, j = url_entries.length; i < j; i++) {

	}

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
		template = document.querySelector('.url_entry.template').cloneNode(1);
		template.querySelector('.call_letters input').value = urls[i].call_letters;
		template.querySelector('.url input').value = urls[i].url;
		urls_container.appendChild(template);
	}

	var add_url_buttons = document.getElementsByClassName('add_a_url');
	for(i = 0, j = add_url_buttons.length; i < j; i++) {
		add_url_buttons[i].addEventListener('click', append_url_template);
	}

}

function append_url_template()
{
	console.log('appending a new url template');
	var template = document.querySelector('.url_entry.template').cloneNode(1),
		container = document.getElementById('urls_container');

	template.className = template.className.replace(/template/, '');
	container.appendChild(template);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
