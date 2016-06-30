var fs = require('fs');

var default_JSON = {
	start_time: 0
};

var filePath = './storage/Metadata.json';

function Metadata() {
	try
	{
		var data = fs.readFileSync(filePath, 'utf8');
		this.data = JSON.parse(data);
	}
	catch (e)
	{
		this.data = {};
	}
	this.data.start_time = this.data.start_time | default_JSON.start_time;
}

Object.defineProperties(Metadata.prototype, {
	start_time: {
		get: function() {
			return this.data.start_time;
		},
		set: function(value) {
			this.data.start_time = value;
		}
	}
});

Metadata.prototype.save = function (callback) {
	fs.writeFile(filePath, JSON.stringify(this.data), 'utf8', callback);
}

module.exports = new Metadata();