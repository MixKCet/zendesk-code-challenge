/** @jsx React.DOM */

var React = require('react');
var ReactDOM = require('react-dom');
var ZendeskApp = React.createFactory(require('./components/ZendeskApp.react'));

var initialState = JSON.parse(document.getElementById('initial-state').innerHTML)

ReactDOM.render(ZendeskApp(initialState), document.getElementById('react-app'));