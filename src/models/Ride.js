var mongoose = require('mongoose');
var schemas = require('./schemas');
var userSchema = schemas.userSchema;
var rideSchema = schemas.rideSchema;
var reviewSchema = schemas.reviewSchema;
var User = require('./User');


// doesn't include error handling

var Ride = (function Ride() {

  var that = Object.create(Ride.prototype);

  that.getAllRides = function() { 
    rideSchema.find({}, function(e, doc) {
      callback(doc);
    });
  };

  that.getRide = function(rideID, callback) {
    rideSchema.find({}, function(e, doc) {
      callback(doc);
    });
  };

  that.addRide = function(origin, destination, departure_time,
                          capacity, creator, riders, passphrase,
                          callback) {
    // check if valid ride
    rideSchema.create({
      "origin": origin,
      "destination": destination,
      "departure_time": departure_time,
      "capacity": capacity,
      "creator": creator,
      "riders": riders,
      "passphrase": passphrase
    });
  };

  that.addRider = function(rideID, rider, callback) {
    // checks if rider exists
    rideSchema.find({ "_id": rideID }, {}, function(e, doc) {
      rideSchema.update({ "_id": rideID },
                        { $push: { "riders": rider } },
                        function(e, subdoc) {

      });
    });
  };

  that.removeRider = function(rideID, rider, callback) {
    // checks if rider exists
    rideSchema.find({ "_id": rideID }, {}, function(e, doc) {
      rideSchema.update({ "_id": rideID },
                        { $pull: { "riders": rider } },
                        function(e, subdoc) {
        
      });
    });
  };

  that.deleteRide = function(rideID, callback) {
    // check if valid ride
    rideSchema.find({ "_id": rideID }).remove(function(e, doc) {
    });
  };

  return that;
})();
 
module.exports = Ride;
