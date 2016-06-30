/** @jsx React.DOM */

var React = require('react');
var Ticket = React.createFactory(require('./Ticket.react.js'));

module.exports = Tickets = React.createClass({
  render: function() {
    var content = this.props.tickets || [];
    content = content.map(function(ticket) {
      return (
        <Ticket key={ticket.id} ticket={ticket} />
      )
    });

    return (
      <div className="col-sm-12">
        <div className="tickets list-group col-md-12 col-lg-8 col-lg-offset-2">{content}</div>
      </div>
    )
  }
}); 