/** @jsx React.DOM */

var React = require('react');

module.exports = ZendeskApp = React.createClass({


	getInitialState: function(props) {
		props = props || this.props;

		return {
			start_time: props.start_time,
			tickets: props.tickets,
			pages: props.pages
		}
	},
	
	render: function()
	{
		return(
			<div className="zendesk-app">
			</div>
		)
	}
});