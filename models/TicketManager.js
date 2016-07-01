var fs = require('fs');

var default_JSON = {storage: {}, index: []};
var filePath = './storage/Tickets.json';

// This TicketManager model is designed to store Tickets from a Zendesk
// Incremental API in two ways:
// - key/value store, for quick lookup
// - and sorted index, for client processing
//
// Our current use case dictates that a Ticket is only added when it is:
// 1. retrieved from the Zendesk API
// 2. doesn't exist in our storage OR
// 3. is different in created_at or updated_at (it has been recreated / updated)
//
// This enables us to maintain the index as a 'most recently added' index
// with little overhead, while still serving its purpose as an index sorted
// on new updates.
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
		// We ignore removeTicket errors, as we don't care whether
		// it already existed in storage. If it didn't, we add it
		// now regardless.
		return this.addTicket(ticket, function(err) {
			if (err)
			{
				return callback(err);
			}
			return callback(null);
		})
	});
};

// The loadMore function takes two parametres:
// @last_TicketID either -1 or a valid Ticket ID
// @pageSize the # of Tickets to retrieve
//
// It will generate errors if an invalid Ticket ID is given (that isn't the -1 
// use case) or if there aren't any Tickets to give.
//
// If the # of Tickets retrieved is less than the pageSize, they'll be returned
// without an error.
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
			var err = new Error("Cannot use non-existant ticketID as point of \
				reference.");
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
	var tickets = this.data.index.slice(start, end).reverse()
		.map(function (ticketID) {
			return self.data.storage[ticketID];
		}
	);

	return callback(null, tickets);
};

TicketManager.prototype.save = function(callback) {
	return fs.writeFile(filePath, JSON.stringify(this.data), 'utf8', callback);
};

module.exports = new TicketManager();