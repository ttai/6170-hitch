var mongoose = require('mongoose');
var schemas = require('./schemas');
var userSchema = schemas.userSchema;
var rideSchema = schemas.rideSchema;
var reviewSchema = schemas.reviewSchema;
var User = require('./User');

// update current ride methods to include both capacities and transport means
// doesn't include error handling
// all the get ride methods (except getRide) finds rides that have not yet closed (whose departure times are still in the future)

var Ride = (function Ride() {

  var that = Object.create(Ride.prototype);

  that.getAllRides = function(callback) {
    rideSchema.find({}, function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  that.inRide = function(userId, callback) {
    rideSchema.findById(rideId, function (err, ride) {
      if (err) {
        callback(err, null);
      } else {
        var riders = ride.riders;
        callback(null, riders.indexOf(userId));
      }
    })
  };

  that.getAllOpenRides = function(callback) {
    var now = new Date();
    rideSchema.find({}).where('remaining_capacity').gte(1).where('departure_time').gte(now).exec(function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  that.findRidesByPickup = function(location, callback) {
    var now = new Date();
    rideSchema.find({ origin: location }).where('departure_time').gte(now).exec(function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  that.findRidesByDestination = function(location, callback) {
    var now = new Date();
    rideSchema.find({ destination: location }).where('departure_time').gte(now).exec(function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  // assumption: date passed in are at 00:00 time.
  that.findRidesByDate = function(date, callback) {
    var end = new Date(date.getTime() + (24 * 60 * 60 * 1000));
    var now = new Date();
    rideSchema.find({}).where('departure_time').gte(now).gte(date).lte(end).exec(function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  // does not check if ride has closed
  that.getRide = function(rideID, callback) {
    rideSchema.findById(rideId, function (err, ride) {
      if (err) {
        callback(err);
      } else {
        if (ride) {
          callback(null, ride);
        } else {
          callback({ msg: 'Invalid ride.' });
        }
      }
    });
  };

  that.addRide = function(userId, origin, destination, departure_time,
                          total_capacity, transport, passphrase,
                          callback) {
    // check if valid ride
    rideSchema.create({
      origin: origin,
      destination: destination,
      departure_time: departure_time,
      total_capacity: total_capacity,
      remaining_capacity: total_capacity - 1,
      riders: [userId],
      transport: transport,
      passphrase: passphrase
    });
  };

  that.addRider = function(rideID, riderId, callback) {
    // checks if ride is full
    rideSchema.findById(rideId, function(err, ride) {
      if (ride.remaining_capacity === 0) {
        callback( { msg: "ride full" } );
      } else {
        rideSchema.findByIdAndUpdate(rideID,
                                      { $inc: { 'remaining_capacity' : -1 } },
                                      { $push: { riders: riderId } },
                                      function(err) {
                                        if (err){
                                          callback(err);
                                        } else {
                                          userSchema.findByIdAndUpdate(riderId, { $push: {rides: rideId} },
                                                                              function (err) {
                                                                                if (err) {
                                                                                  callback(err);
                                                                                } else {
                                                                                  callback(null);
                                                                                }
                                                                              });
                                        }
                                    });
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
        callback(err);
      } else {
        userSchema.findByIdAndUpdate(riderId,
                                     { $pull: {rides: rideId} },
                                     function (err) {
          if (err) {
            callback(err);
          } else {
            //delete ride if no more riders
            rideSchema.findById(rideId, function (err, ride) {
              if (ride.remaining_capacity === ride.total_capacity) {
                deleteRide(rideId, function(err) {
                  if (err) {
                    callback(err);
                  } else {
                    callback(null);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  that.deleteRide = function(rideID, callback) {
    // check if valid ride
    rideSchema.findByIdAndRemove(rideId, function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  };

  Object.freeze(that);
  return that;
})();
 
module.exports = Ride;
