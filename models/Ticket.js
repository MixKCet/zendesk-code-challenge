var mongoose = require('mongoose');

// We create a mongoose schema for our Ticket data
var schema = new mongoose.Schema({
    id              : Number
});

schema.statics.getTickets = function(page, skip, callback) {

  var tickets = [],
      start = (page * 10) + (skip * 1);

  Ticket.find({}, 'id type title description created_at updated_at', {skip: start, limit: 10}).sort({date: 'desc'}).exec(function(err, docs) {

    if (!err) 
    {
      tickets = docs;
    }

    callback(tickets);
  });

};

module.exports = Ticket = mongoose.model('Ticket', schema);
