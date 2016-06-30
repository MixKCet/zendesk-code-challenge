var fs = require('fs');

var default_JSON = {storage: {}, index: []};
var filePath = './storage/Tickets.json';

function TicketManager() {
	try
	{
		var data = fs.readFileSync(filePath, 'utf8');
		this.data = JSON.parse(data);
	}
	catch (e)
	{
		this.data = default_JSON;
	}
};

TicketManager.prototype.getIndex = function(ticketID) {
	return this.data.index.indexOf(ticketID);
}

TicketManager.prototype.getTicket = function(ticketID, callback) {
	if (typeof this.data.storage[ticketID] == 'undefined')
	{
		var err = new Error("Ticket ID was not found in data.");
		return callback(err);
	}
	
	return callback(null, this.data.storage[ticketID], this.getIndex(ticketID));
};

TicketManager.prototype.addTicket = function(ticket, callback) {
	if (!ticket || typeof ticket.id == 'undefined')
	{
		var err = new Error("Ticket didn't contain ID field.");
		return callback(err);
	}
	
	var ticketID = ticket.id;
	if (typeof this.data.storage[ticketID] != 'undefined')
	{
		var c1 = this.data.storage[ticketID].created_at
		  , c2 = ticket.created_at
		  , u1 = this.data.storage[ticketID].updated_at
		  , u2 = ticket.updated_at;

		if (c1 == c2 && u1 == u2)
		{
			var err = new Error("Ticket is a duplicate, no reason to re-add.");
			return callback(err);
		}

		var index = this.getIndex(ticketID);
		this.data.index.splice(index, 1);

		this.data.storage[ticketID] = null;
		delete this.data.storage[ticketID];
	}

	this.data.storage[ticketID] = ticket;
	this.data.index.push(ticketID);
	return callback(null);
};

TicketManager.prototype.removeTicket = function(ticketID, callback) {
	return this.getTicket(ticketID, (err, ticket, index) => {
		if (err) {
			return callback(err);
		}
		var ticketID = ticket.id;
		var index = this.getIndex(ticketID);
		this.data.index.splice(index, 1);

		this.data.storage[ticketID] = null;
		delete this.data.storage[ticketID];
		return callback(null);
	});
};

TicketManager.prototype.modifyTicket = function(ticketID, ticket, callback) {
	return this.removeTicket(ticketID, function(err) {
		return this.addTicket(ticket, function(err) {
			if (err)
			{
				return callback(err);
			}
			return callback(null);
		})
	});
};

TicketManager.prototype.loadMore = function(last_ticketID, pageSize, callback) {
	var index;
	if (last_ticketID == -1)
	{
		index = this.data.index.length;
	}
	else
	{
		index = this.getIndex(last_ticketID);
		if (index == -1)
		{
			var err = new Error("Cannot use non-existant ticketID as point of reference.");
			return callback(err);
		}
	}

	var end   = index;
	var start = index - pageSize;
	if (end <= 0)
	{
		var err = new Error("There aren't any more tickets to load.");
		return callback(err);
	}

	if (start < 0)
	{
		start = 0;
	}

	var self = this;
	var tickets = this.data.index.slice(start, end).reverse().map(function (ticketID) {
		return self.data.storage[ticketID];
	});

	return callback(null, tickets);
};

TicketManager.prototype.save = function(callback) {
	return fs.writeFile(filePath, JSON.stringify(this.data), 'utf8', callback);
};

module.exports = new TicketManager();