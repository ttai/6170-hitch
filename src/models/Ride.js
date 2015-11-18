var mongoose = require('mongoose');
var schemas = require('./schemas');
var userSchema = schemas.userSchema;
var rideSchema = schemas.rideSchema;
var reviewSchema = schemas.reviewSchema;
var User = require('./User');

// update current ride methods to include both capacities and transport means
// doesn't include error handling
// all the get ride methods (except getRide) finds rides that have not yet passed.

var Ride = (function Ride() {

  var that = Object.create(Ride.prototype);

  that.getAllRides = function(callback) {
    rideSchema.find({}, function(err, rides) {
      if (err) {
        console.log(err);
      } else {
        callback(null, rides);
      }
    });
  };

  that.getAllOpenRides = function(callback) {
    var now = new Date();
    rideSchema.where('remaining_capacity').gte(1).where('departure_time').gte(now).exec(function(err, rides) {
      if (err) {
        console.log(err);
      } else {
        callback(null, rides);
      }
    });
  };

  that.findRidesByPickup = function(location, callback) {
    var now = new Date();
    rideSchema.find({ origin: location }).where('departure_time').gte(now).exec(function(err, rides) {
      if (err) {
        console.log(err);
      } else {
        callback(null, rides);
      }
    });
  };

  that.findRidesByDestination = function(location, callback) {
    var now = new Date();
    rideSchema.find({ destination: location }).where('departure_time').gte(now).exec(function(err, rides) {
      if (err) {
        console.log(err);
      } else {
        callback(null, rides);
      }
    });
  };

  // assumption: date passed in are at 00:00 time.
  that.findRidesByDate = function(date, callback) {
    var end = new Date(date.getTime() + (24 * 60 * 60 * 1000));
    var now = new Date();
    rideSchema.find({ where('departure_time').gte(now).gte(date).lte(end).exec(function(err, rides) {
      if (err) {
        console.log(err);
      } else {
        callback(null, rides);
      }
    });
  };

  // does not check if ride has closed
  that.getRide = function(rideID, callback) {
    rideSchema.findById(rideId, function (err, ride) {
      if (err) {
        console.log(err);
      } else {
        if (ride) {
          callback(null, ride);
        } else {
          callback({ msg: 'Invalid ride.' });
        }
      }
    });
  };

  that.addRide = function(origin, destination, departure_time,
                          total_capacity, riders, transport, passphrase,
                          callback) {
    // check if valid ride
    rideSchema.create({
      origin: origin,
      destination: destination,
      departure_time: departure_time,
      total_capacity: total_capacity,
      remaining_capacity: total_capacity - 1,
      riders: riders,
      transport: transport,
      passphrase: passphrase
    });
  };

  that.addRider = function(rideID, riderId, callback) {
    // checks if rider exists
      rideSchema.findByIdAndUpdate(rideID,
                                    { $inc: { 'remaining_capacity' : -1 } },
                                    { $push: { riders: riderId } },
                                    function(err) {
                                      if (err){
                                        console.log(err);
                                      } else {
                                        callback(null);
                                      }
      });
      userSchema.findByIdAndUpdate(riderId,
                                    { $push: {rides: rideId} },
                                    function (err) {
                                      if (err) {
                                        console.log(err);
                                      } else {
                                        callback(null);
                                      }
      });
  };

  that.removeRider = function(rideID, riderId, callback) {
    // checks if rider exists
    rideSchema.findByIdAndUpdate(rideID,
                                  { $inc: { 'remaining_capacity' : 1 } },
                                  { $pull: { riders: riderId } },
                                  function(err) {
                                    if (err) {
                                      console.log(err);
                                    } else {
                                      callback(null);
                                    }
    });
    userSchema.findByIdAndUpdate(riderId,
                                  { $pull: {rides: rideId} },
                                  function (err) {
                                    if (err) {
                                      console.log(err);
                                    } else {
                                      callback(null);
                                    }
    });
  };

  that.deleteRide = function(rideID, callback) {
    // check if valid ride
    rideSchema.findByIdAndRemove(rideId, function(err) {
      if (err) {
        console.log(err);
      } else {
        callback(null);
      }
    });
  };

  Object.freeze(that);
  return that;
})();
 
module.exports = Ride;
