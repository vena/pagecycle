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

	save_options();
}

document.addEventListener('DOMContentLoaded', restore_options);
