/** @jsx React.DOM */

var React = require('react');
var ZendeskApp = require('./components/ZendeskApp.react');

var initialState = JSON.parse(document.getElementById('initial-state').innerHTML)

React.renderComponent
(
  <ZendeskApp tweets={initialState}/>,
  document.getElementById('react-app')
);