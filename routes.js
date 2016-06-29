var JSX = require('node-jsx').install(),
	React = require('react'),
  ZendeskApp = require('./components/ZendeskApp.react'),
  Metadata = require('./models/Metadata'),
  Tickets = require('./models/TicketsNMDB');

module.exports = 
{
  index: function(req, res) 
  {
    Tickets.getTickets(0, {}, function (err, tickets) {
      var markup = React.renderComponentToString(
        ZendeskApp(
        {
          start_time: Metadata.start_time,
          tickets: tickets,
          pages: Tickets.getPages(),
        })
      );

      res.render('home', 
      {
        markup: markup, // Pass rendered react markup
        //state: JSON.stringify(Tickets.tickets) // Pass current state to client side
      });
    });
  },

  page: function(req, res) 
  {
    Tickets.getTickets(req.params.page, {}, function(err, tickets) 
    {
      if (!err) res.send(tickets);
    });
  }
}