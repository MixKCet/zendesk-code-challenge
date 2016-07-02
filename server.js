var express = require('express'),
	exphbs = require('express-handlebars'),
	heartbeats = require('heartbeats'),
	http = require('http'),
	zendesk = require('node-zendesk'),
	routes = require('./routes'),
	config = require('./config'),
	TicketManager = require('./models/TicketManager'),
	Metadata = require('./models/Metadata');

var client_username = "";
var client_password = "";
var debug = false;

var RATE  = (60000 + 1000) / 10;

// We gather Zendesk client args from the process.
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

if (!client_username || !client_password)
{
	var err = new Error("The server needs both a client and password. See the README.");
	console.log(err);
	return;
}

// Our express app is essentially our local server, running on a given port or 
// 8080. The port is supplied in package.json
var app = express();
var port = process.env.PORT || 8080;

// We're using handlebars for data-binding & rendering of our HTML files.
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// We don't need etag overhead. We're using a RESTful service and React to manage 
// our state!
app.disable('etag');

var zendeskLogin = config.zendesk;
zendeskLogin.username = client_username;
zendeskLogin.password = client_password;

// We'll make all our API calls through this Zendesk client. See:
// https://github.com/blakmatrix/node-zendesk
var client = zendesk.createClient(zendeskLogin);

// We enable side-loading for Groups and Users.
client.tickets.sideLoad = ['users', 'groups'];

// We set up an index route for serving of our React App.
app.get('/', routes.index);

// We set our /public as our static content dir.
// We'll pre-populate this directory using NPM BUILD, so that index ^ can
// access the JS it needs.
app.use("/", express.static(__dirname + "/public/"));

// This starts our server.
var server = http.createServer(app).listen(port, function() 
{
	console.log('The express server listening on port ' + port);
});

// Other than serving static files with frontend dynamic content, we also
// care about requests. We handle these requests here to ensure our React
// page updates dynamically.
//
// There are pros-and-cons to socket.io over AJAX, we discuss them in the
// README.
var io = require('socket.io').listen(server);
io.on('connection', function(sockect) {

	// These are two types of Ticket updates.
	// requestMore: backlog of Ticket data from a given Ticket ID.
	// requestNewTickets: new Tickets with a given # of Tickets.
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

// We wrap our API call here to ensure proper two-phase commit of meta-data
// and Ticket data, plus IO calls.
function getTickets(start_time)
{
	client.tickets.incremental(start_time, function (err, statusList, body, 
		responseList, resultList) 
	{
		if (err) 
		{
			console.log(err);
			return;
		}

		var users        = resultList.users || [];	
		var users_dict   = {};	
		var groups       = resultList.groups || [];
		var groups_dict  = {};
		var init_tickets = resultList.tickets || [];
		var start_time   = resultList.start_time || 0;
		var end_time     = resultList.end_time;

		// We don't store User or Group data for now, just retrieve them using
		// side-loading.
		users.forEach((user) => {
			users_dict[user.id] = user;
		});

		groups.forEach((user) => {
			groups_dict[user.id] = user;
		});

		var delete_tickets = [];
		var tickets = [];

		console.log("API call returned #", init_tickets.length, "tickets.");

		init_tickets.forEach(function (ticket) {
			ticket.requester = users_dict[ticket.requester_id].name;
			ticket.group     = groups_dict[ticket.group_id].name;

			TicketManager.getTicket(ticket, function (err, ticket, index) {
				if (!err) delete_tickets.push(ticket.id);
			});
			TicketManager.addTicket(ticket, function (err) {
				if (!err) tickets.push(ticket);
			});
		});

		// There's an error here with the Incremental Time and using end_time.
		// TODO: Fix it.
		Metadata.start_time = end_time;
		
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

// We run an initial call. Note: the first time the server is run, the start
// time will be 0, to ensure the TicketManager is populated.
getTickets(Metadata.start_time);

// We create a server heartbeat to check for new tickets based on our Zendesk
// rate limit.
var heart = heartbeats.createHeart(RATE);
heart.createEvent(1, function(heartbeat, last) 
{
	console.log("The server's heart beat!");
	console.log("# Tickets:", TicketManager.data.index.length);
	console.log("Next Start Time:", Metadata.start_time);
	console.log("");
	getTickets(Metadata.start_time);
});