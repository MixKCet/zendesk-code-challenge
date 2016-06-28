var express = require('express'),
  exphbs = require('express-handlebars'),
  heartbeats = require('heartbeats'),
  http = require('http'),
  mongoose = require('mongoose'),
  zendesk = require('node-zendesk'),
  routes = require('./routes'),
  config = require('./config');

// Create an express instance and set a port variable
var app = express();
var port = process.env.PORT || 8080;

// Set handlebars as the templating engine
app.engine('handlebars', exphbs({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Disable etag headers on responses
app.disable('etag');

// Connect to our mongo database
mongoose.connect('mongodb://localhost/zendesk-challenge');

// Create a new Zendesk client instance
var client = zendesk.createClient(config.zendesk);

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
var start_time = 0;
function getTickets(start_time)
{
  client.tickets.incremental(start_time, function (err, statusList, body, responseList, resultList) 
  {
    if (err || !body.tickets || !body.end_time) 
    {
      return;
    }

    start_time = body.end_time;

    body.forEach(function (ticket) {
      var mongoTicket = {
        id: body['id'],
      };
      var ticketEntry = new Ticket(ticket);
      ticketEntry.save(function(err) {
        if (!err) 
        {
          tickets.push(ticketEntry);
        }
      });
    });
    
    if (!tickets)
    {
      io.emit('tickets', tickets);
    }
  });
}

getTickets(start_time);

// Setup a 1 second heartbeat
var heart = heartbeats.createHeart(1000);
heart.createEvent(1, function(heartbeat, last) 
{
  getTickets(start_time);
});