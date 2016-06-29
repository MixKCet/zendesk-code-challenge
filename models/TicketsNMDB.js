var fs = require('fs');

var default_JSON = {};
var filePath = './storage/Tickets.json';
var pageSize = 25;

function sortTickets(data) {
	return {};
}

function Tickets() {
	try
	{
		var data = fs.readFileSync(filePath, 'utf8');
		this.data = JSON.parse(data);
	}
	catch (e)
	{
		this.data = default_JSON;
	}
	this.sorted_data = sortTickets(this.data);
};

Tickets.prototype.addTicket = function(ticket, options, callback) {
	var modify = options.modify || false;

	if (!ticket.id)
	{
		var err = new Error("Ticket didn't contain ID field.");
		callback(err);
		return;
	}

	if (typeof this.data.ID != 'undefined')
	{
		if (modify)
		{
			if (this.data[ticket.ID] === ticket)
			{
				var err = new Error("Ticket is already identical to proposed new value.");
				callback(err);
				return;
			}
		}
		else
		{
			var err = new Error("Ticket already exists in JSON data.");
			callback(err);
			return;
		}
	}

	this.data[ticket.id] = ticket;
	this.sorted_data = null;
	callback(null);
};

Tickets.prototype.removeTicket = function(ticketID, callback) {
	if (typeof this.data[ticketID] == 'undefined')
	{
		var err = new Error("Ticket does not exist in JSON data.");
		callback(err);
		return;
	}

	delete this.data[ticketID];
	callback(null);
};

Tickets.prototype.modifyTicket = function(ticketID, ticket, options, callback) {
	var modify = options.modify || false;

	this.removeTicket(ticketID, function(err) {
		if (err)
		{
			callback(err);
			return;
		}

		this.addTicket(ticket, modify, function(err) {
			if (err)
			{
				callback(err);
				return;
			}
		})
	});
	callback(null);
};

Tickets.prototype.getTickets = function(page, options, callback) {
	var asc = options.asc || true;
	var pages = this.getPages();

	if (page > pages)
	{
		var err = new Error("Attempt to retrieve page number greater than exists.");
		callback(err);
		return;
	}

	var tickets = [];
	if (!this.sorted_data)
	{
		this.sorted_data = sortTickets(this.data);
	}

	if (asc)
	{
		tickets = this.sorted_data[page];
	}
	else
	{
		tickets = this.sorted_data[pages - page];
	}

	callback(null, tickets);
	return;
};

Tickets.prototype.getPages = function() {
	return Math.ceil(Object.keys(this.data).length / pageSize);
};

Tickets.prototype.save = function(callback) {
	fs.writeFile(filePath, JSON.stringify(this.data), 'utf8', callback);
};

module.exports = new Tickets();