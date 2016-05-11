var data = {};

function set(key, value){
	data[key] = value;
}

function get(key){
	return data[key];
}

module.exports = {
	set: set,
	get: get
}