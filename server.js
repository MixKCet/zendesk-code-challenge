var express = require('express'),
  exphbs = require('express-handlebars'),
  heartbeats = require('heartbeats'),
  http = require('http'),
  mongoose = require('mongoose'),
  zendesk = require('node-zendesk'),
  routes = require('./routes'),
  config = require('./config'),
  TicketsNMDB = require('./models/TicketsNMDB'),
  Metadata = require('./models/Metadata');

var client_username = "";
var client_password = "";

// Gather Zendesk Client user variables from command args
process.argv.forEach((val, index, array) => {
  if (val == "--password" || val == "-p")
  {
    if (array.length >= index)
    {
      client_password = array[index+1];
    }
  }
  if (val == "--username" || val == "-u")
  {
    if (array.length >= index)
    {
      client_username = array[index+1];
    }
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

// Page Route
app.get('/page/:page/:skip', routes.page);

// Set /public as our static content dir
app.use("/", express.static(__dirname + "/public/"));

// Fire it up (start our server)
var server = http.createServer(app).listen(port, function() 
{
  console.log('The express server listening on port ' + port);
});

// Initialize socket.io
var io = require('socket.io').listen(server);

// Setup MongoDB
function getTickets(start_time)
{
  client.tickets.incremental(start_time, function (err, statusList, body, responseList, resultList) 
  {
    if (err || !resultList.tickets || !resultList.end_time) 
    {
      return;
    }

    tickets = [];

    resultList.tickets.forEach(function (ticket) {
      TicketsNMDB.addTicket(ticket, { modify: true } , function (err) {
        if (!err) tickets.push(ticket);
      });
    });

    Metadata.start_time = resultList.end_time + 1;

    TicketsNMDB.save(function (err) {
      if (!err) Metadata.save();
    })
    
    if (tickets.length > 0)
    {
      console.log("We retrieved", tickets.length, "new tickets.");
      io.emit('tickets', tickets);
    }
  });
}

// Get all Tickets since the last time server.js was run
getTickets(Metadata.start_time);

// Setup a 1 second heartbeat
var heart = heartbeats.createHeart(10000);
heart.createEvent(1, function(heartbeat, last) 
{
  console.log("The server's heart beat!");
  getTickets(Metadata.start_time);
  console.log("New Page #:", TicketsNMDB.getPages());
});