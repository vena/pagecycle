// initialise the database
var PCDB = WebSQL('pagecycle');

PCDB.query(
	'CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY AUTOINCREMENT, sort INTEGER, title TEXT, url TEXT)'
);

// initialise interval
if (!$.isNumeric(localStorage.interval)) {
	localStorage.interval = 60*1000;
}