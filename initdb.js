// initialise the database
var PCDB = WebSQL('pagecycle');

PCDB.query(
	'CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT)'
);