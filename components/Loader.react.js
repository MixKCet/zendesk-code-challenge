/** @jsx React.DOM */

var React = require('react');

module.exports = Loader = React.createClass({
  render: function(){
    return (
      <div className={"loader" + (this.props.paging ? " active" : "") + (this.props.top ? " top" : "") + " col-sm-12"}>
        <img src="svg/loader.svg" />
      </div>
    )
  }
});