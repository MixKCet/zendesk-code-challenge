/** @jsx React.DOM */

var React = require('react');
var Tickets = React.createFactory(require('./Tickets.react.js'));
var Loader = React.createFactory(require('./Loader.react.js'));
var NotificationBar = React.createFactory(require('./NotificationBar.react.js'));

module.exports = ZendeskApp = React.createClass({
	deleteTicket: function(ticketID) {
		var updated = {};
		updated.tickets = this.state.tickets;

		var index = 0;
		while (index < updated.tickets.length)
		{
			if (updated.tickets[index].id == ticketID)
				break;

			index++;
		}

		if (index < updated.tickets.length)
		{
			updated.tickets.splice(index, 1);
			this.setState(updated);
		}
	},

	updateTickets: function(new_tickets) {
		var updated = {};
		updated.new_tickets = this.state.new_tickets;
		updated.new_tickets += new_tickets;
		this.setState(updated);
	},

	requestNewTickets: function() {
		var data = { ticketID: -1, pageSize: this.state.new_tickets };

		var socket = io.connect();
		socket.emit("requestNewTickets", data);
		this.setState({paging_top: true, "new_tickets": 0});
	},

	requestMore: function() {
		var last_ticket;
		if (this.state.tickets.length < 1)
			last_ticket = {id: -1};
		else
			last_ticket = this.state.tickets.slice(-1)[0];

		var data = { ticketID: last_ticket.id, pageSize: 15 };

		var socket = io.connect();
		socket.emit("requestMore", data);
		this.setState({paging_bot: true});
	},

	loadNewTickets: function(new_tickets) {
		var updated = {};
		updated.tickets = this.state.tickets;

		new_tickets.reverse();
		new_tickets.forEach((ticket) => {
			updated.tickets.unshift(ticket);
		});

		updated.paging_top = false;

		var self = this;
		setTimeout(function() 
		{
			self.setState(updated);
		}, 2000);
	},

	loadMoreTickets: function(more_tickets) {
		var current_tickets = this.state.tickets;

		more_tickets.forEach((ticket) => {
			current_tickets.push(ticket);
		});

		var self = this;
		setTimeout(function() 
		{
			self.setState({ paging_bot: false });
			self.setState({ tickets: current_tickets });
		}, 2000);
	},

	noMoreTickets: function() {
		this.setState({no_more_tickets: true, paging_bot: false});
	},

	atBottom: function () {
		var at_bottom = false;
		if($(window).scrollTop() + $(window).height() + 100 >= $(document).height()) {
			at_bottom = true;
		}
		return at_bottom;
	},

	checkWindowScroll: function() {
		var at_bottom = this.atBottom();

		if (at_bottom && this.state.no_more_tickets != true && this.state.paging_bot != true) 
		{
			this.requestMore();
		}
	},

	componentDidUpdate: function(prevProps, prevState) {
		if (prevState.paging_bot == true && this.state.paging_bot != true)
		{
			this.checkWindowScroll();
		}
	},

	getInitialState: function(props) {
		props = props || this.props || {};
		var tickets = props.tickets || [];

		return {
			new_tickets: 0,
			tickets: tickets,
			paging_top: false,
			paging_bot: false,
			no_more_tickets: false
		};
	},

	componentWillReceiveProps: function(newProps, oldProps) {
		this.setState(this.getInitialState(newProps));
	},

	componentDidMount: function() {
		var self = this;
		var socket = io.connect();
		socket.on('updateTickets', (new_tickets) => { self.updateTickets(new_tickets); });
		socket.on('noMoreTickets', () => { self.noMoreTickets(); });
		socket.on('loadMoreTickets', (more_tickets) => { self.loadMoreTickets(more_tickets); });
		socket.on('loadNewTickets', (new_tickets) => { self.loadNewTickets(new_tickets); });
		socket.on('deleteTicket', (ticketID) => { self.deleteTicket(ticketID); });

		window.addEventListener('scroll', this.checkWindowScroll);
		this.checkWindowScroll();
	},

	render: function()
	{
		return (<div className="zendesk-app">
					<Loader paging={this.state.paging_top} top={true} />
					<Tickets tickets={this.state.tickets} />
					<Loader paging={this.state.paging_bot} top={false} />
					<NotificationBar count={this.state.new_tickets} onShowNewTickets={this.requestNewTickets} />
				</div>);
	}
});