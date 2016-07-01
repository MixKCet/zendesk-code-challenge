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
		// We use a callback here for error checking, and then render our App
		// Server-Side to reduce 'visible' latency.
		TicketManager.loadMore(-1, 15, function (err, tickets) {
			if (err) tickets = [];

			var markup = ReactDOMServer.renderToString( 
				ZendeskApp({ tickets: tickets }) 
			);

			res.render('home', 
			{
				markup: markup,
				state: JSON.stringify({ tickets: tickets }),
			});
		});
	}
}