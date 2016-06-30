var JSX = require('node-jsx').install(),
	React = require('react'),
  ReactDOMServer = require('react-dom/server'),
  ZendeskApp = React.createFactory(require('./components/ZendeskApp.react')),
  Metadata = require('./models/Metadata'),
  TicketManager = require('./models/TicketManager');

module.exports = 
{
  index: function(req, res) 
  {
    TicketManager.loadMore(-1, 25, function (err, tickets) {
      var markup = ReactDOMServer.renderToString( ZendeskApp({ tickets: tickets }) );

      res.render('home', 
      {
        markup: markup, // Pass rendered react markup
        state: JSON.stringify({ tickets: tickets }),
      });
    });
  }
}