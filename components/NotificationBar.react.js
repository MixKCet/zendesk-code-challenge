/** @jsx React.DOM */

var React = require('react');

module.exports = NotificationBar = React.createClass({
	propTypes: {
		onShowNewTickets: React.PropTypes.func
	},

	showNewTickets: function() {
		if (typeof this.props.onShowNewTickets === 'function') {
			this.props.onShowNewTickets();
		}
	},

	render: function(){
		var count = this.props.count;
		return (<div className={"notification-bar" + (count ? ' active' : '')}>
					<span>There are {count} new tickets! <a href="#top" onClick={this.showNewTickets}>Click here to see them.</a></span>
				</div>);
	}
});