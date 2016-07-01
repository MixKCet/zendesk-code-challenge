/** @jsx React.DOM */

var React = require('react');
var CustomDate = require('../models/CustomDate');

module.exports = Ticket = React.createClass({
  render: function() {
    var ticket = this.props.ticket;
    var status_class = "";
    if (ticket.status == "open")
    {
      status_class = "label-primary";
    }
    else if (ticket.status == "pending")
    {
      status_class = "label-info";
    }
    else if (ticket.status == "hold")
    {
      status_class = "label-default";
    }
    else if (ticket.status == "solved")
    {
      status_class = "label-success";
    }
    else
    {
      status_class = "label-danger";
    }

    var created_at = new CustomDate(ticket.created_at);
    var updated_at = new CustomDate(ticket.updated_at);

    return (
      <tr data-toggle="collapse" data-target={"#collapse_" + ticket.id} className="accordian-toggle row-data border-bottom-round">
        <th scope="row" className="border-bottom-left">{ticket.id}</th>
        <td>
          <span className={"label " + status_class}>
            {ticket.status}
          </span>
        </td>
        <td>{ticket.subject}</td>
        <td>{ticket.requester}</td>
        <td>{created_at.getPrettyString()}</td>
        <td>{updated_at.getPrettyString()}</td>
        <td className="border-bottom-right">{ticket.group}</td>
      </tr>
    )
  }
});