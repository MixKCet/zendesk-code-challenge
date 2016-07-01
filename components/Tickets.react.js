/** @jsx React.DOM */

var React = require('react');
var Ticket = React.createFactory(require('./Ticket.react.js'));
var TicketDetails = React.createFactory(require('./TicketDetails.react.js'));

module.exports = Tickets = React.createClass({
  render: function() {
    var content = this.props.tickets || [];
    var contentDOM = [];
    for (var i = 0; i < content.length; i++)
    { 
      contentDOM.push(<Ticket key={content[i].id * 2 - 1} ticket={content[i]} />);
      contentDOM.push(<TicketDetails key={content[i].id * 2}ticket={content[i]} />);
    }

    if (contentDOM.length == 0)
    {
      contentDOM.push(<tr></tr>);
    }

    return (
      <div className="container">
        <div className="col-sm-12 tickets">
          <table className="table table-hover table-tickets">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Subject</th>
                <th>Requester</th>
                <th>Requested</th>
                <th>Updated</th>
                <th>Group</th>
              </tr>
            </thead>
            <tbody>
              {contentDOM}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}); 