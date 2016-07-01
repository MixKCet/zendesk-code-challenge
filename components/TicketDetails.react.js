/** @jsx React.DOM */

var React = require('react');

module.exports = TicketDetails = React.createClass({
  render: function() {
    var ticket = this.props.ticket;
    var tags   = ticket.tags.join(", ");
    return (
      <tr className="border-bottom-round">
        <td colSpan="7" className="hidden-row border-bottom-round">
          <div className="accordian-body collapse hidden-row border-bottom-round" id={"collapse_" + ticket.id}>
            <div className="col-sm-9">
              <h4>Description:</h4>
              <p>{ticket.description}</p>
            </div>
            <div className="col-sm-3">
              <h4>Tags:</h4>
              <p>{tags}</p>
            </div>
          </div>
        </td>
      </tr>
    )
  }
});