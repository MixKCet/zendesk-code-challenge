var JSX = require('node-jsx').install(),
	React = require('react'),
  ZendeskApp = require('./components/ZendeskApp.react'),
  Ticket = require('./models/Ticket');

module.exports = 
{
  index: function(req, res) 
  {
    Ticket.getTickets(0,0, function(tickets, pages) 
    {
      var markup = React.renderComponentToString(
        ZendeskApp(
        {
          tickets: tickets
        })
      );

      res.render('home', 
      {
        markup: markup, // Pass rendered react markup
        state: JSON.stringify(tickets) // Pass current state to client side
      });
    });
  },

  page: function(req, res) 
  {
    Ticket.getTickets(req.params.page, req.params.skip, function(tickets) 
    {
		  res.send(tickets);
    });
  }
}