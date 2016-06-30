var express = require('express'),
	exphbs = require('express-handlebars'),
	heartbeats = require('heartbeats'),
	http = require('http'),
	mongoose = require('mongoose'),
	zendesk = require('node-zendesk'),
	routes = require('./routes'),
	config = require('./config'),
	TicketManager = require('./models/TicketManager'),
	Metadata = require('./models/Metadata');

var client_username = "";
var client_password = "";
var debug = false;

var RATE  = (60000 + 1000) / 10;

// Gather Zendesk Client user variables from command args
process.argv.forEach((val, index, array) => {
	if (val == "--password" || val == "-p")
	{
		if (array.length >= index)
		{
			client_password = array[++index];
		}
	}
	if (val == "--username" || val == "-u")
	{
		if (array.length >= index)
		{
			client_username = array[++index];
		}
	}
	if (val == "--debug")
	{
		debug = true;
	}
});

// Check to ensure client details have been supplied
if (!client_username || !client_password)
{
	var err = new Error("The server needs both a client and password. See the README.");
	console.log(err);
	return;
}

// Create an express instance and set a port variable
var app = express();
var port = process.env.PORT || 8080;

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');

// Connect to our Ticket mongoDB (DISABLED FOR NOW)
// mongoose.connect('mongodb://localhost/zendesk-challenge');

var zendeskLogin = config.zendesk;
zendeskLogin.username = client_username;
zendeskLogin.password = client_password;

// Create a new Zendesk client instance
var client = zendesk.createClient(zendeskLogin);

// Index Route
app.get('/', routes.index);

// Set /public as our static content dir
app.use("/", express.static(__dirname + "/public/"));

// Fire it up (start our server)
var server = http.createServer(app).listen(port, function() 
{
	console.log('The express server listening on port ' + port);
});

// Initialize socket.io
var io = require('socket.io').listen(server);
io.on('connection', function(sockect) {
	// console.log("connected user");
	sockect.on("requestMore", function (data) {
		var ticketID = data.ticketID;
		var pageSize = data.pageSize;

		TicketManager.loadMore(ticketID, pageSize, (err, tickets) => {
			if (!err) sockect.emit("loadMoreTickets", tickets);
			else sockect.emit("noMoreTickets");
		});
	});

	sockect.on("requestNewTickets", function (data) {
		var ticketID = data.ticketID;
		var pageSize = data.pageSize;

		TicketManager.loadMore(ticketID, pageSize, (err, tickets) => {
			if (!err) sockect.emit("loadNewTickets", tickets);
		});
	});
});

// Init + Update JSON File of Tickets
var debug_heartbeats = 0;
function getTickets(start_time)
{
	client.tickets.incremental(start_time, function (err, statusList, body, responseList, resultList) 
	{
		if (err) 
		{
			console.log(err);
			return;
		}

		var init_tickets = resultList.tickets || [];
		var start_time   = resultList.start_time || 0;
		var end_time     = resultList.end_time || Metadata.start_time;

		// We have a debug mode to simulate Tickets being added over time.
		if (debug)
		{
			var length = debug_heartbeats * 5;
			if (length+5 > init_tickets.length)
				init_tickets = [];
			else
				init_tickets = init_tickets.slice(length, length+5);
			debug_heartbeats++;
		}

		delete_tickets = [];
		tickets = [];

		init_tickets.forEach(function (ticket) {
			TicketManager.getTicket(ticket, function (err, ticket, index) {
				if (!err) delete_tickets.push(ticket.id);
			});
			TicketManager.addTicket(ticket, function (err) {
				if (!err) tickets.push(ticket);
			});
		});

		// We have a debug mode to simulate Tickets being added over time.
		if (debug)
		{
			Metadata.start_time = Metadata.start_time;
		}
		else
		{
			Metadata.start_time = end_time;
		}
		
		if (tickets.length > 0)
		{
			io.emit("updateTickets", tickets.length);
			delete_tickets.forEach((ticketID) => {
				io.emit("deleteTicket", ticketID);
			});
		}

		TicketManager.save(function (err) {
			if (!err) Metadata.save();
		})
	});
}

// Get all Tickets since the last time server.js was run
getTickets(Metadata.start_time);

// Setup a heartbeat that ensures we never exceed Zendesk RATE limit
var heart = heartbeats.createHeart(RATE);
heart.createEvent(1, function(heartbeat, last) 
{
	console.log("The server's heart beat!");
	console.log("# Tickets:", TicketManager.data.index.length);
	console.log("Next Start Time:", Metadata.start_time);
	console.log("");
	getTickets(Metadata.start_time);
});