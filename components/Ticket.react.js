/** @jsx React.DOM */

var React = require('react');

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

    return (
      <div className="ticket list-item panel panel-default">
        <div className="panel-body">
          <div className="row col-sm-12">
            <div className="col-sm-3">
              <span className={"label " + status_class}>
              {ticket.status}
              </span>
            </div>
            <div className="col-sm-3">
              <span>Ticket {ticket.id}</span>
            </div>
            <div className="col-sm-3">
              <span>{ticket.created_at}</span>
            </div>
          </div>
          <div className="row col-sm-12">
            <div className="col-sm-12">
              <span>{ticket.description}</span>
            </div>
          </div>
          <div className="row col-sm-12">
            <div className="col-sm-3">
              {ticket.recipient}
            </div>
          </div>
        </div>
      </div>
    )
  }
});