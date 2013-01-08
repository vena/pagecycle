function save_options()
{
	var intervalEl = document.getElementById('interval');

	// Make sure interval is a number
	if (!intervalEl.value || !/^\d+$/.test(intervalEl.value)) {
		intervalEl.style.borderColor = 'red';
	} else {
		localStorage['interval'] = interval.value;
	}

}

function restore_options()
{
	var intervalEl = document.getElementById('interval'),
		interval = localStorage['interval'];

	intervalEl.value = interval || 3600;

	intervalEl.addEventListener('keyup', save_options);

	var add_url_buttons = document.getElementsByClassName('add_a_url');
	for(var i = 0, j = add_url_buttons.length; i < j; i++) {
		add_url_buttons[i].addEventListener('click', append_url_template);
	}

	save_options();
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
