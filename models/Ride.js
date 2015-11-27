var mongoose = require('mongoose');
var schemas = require('./schemas');
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;
var User = require('./User');

// update current ride methods to include both capacities and transport means
// doesn't include error handling
// all the get ride methods (except getRide) finds rides that have not yet closed (whose departure times are still in the future)

var Ride = (function Ride() {

  var that = Object.create(Ride.prototype);

  that.getAllRides = function(callback) {
    rideModel.find({}, function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  that.inRide = function(userId, rideId, callback) {
    rideModel.findById(rideId, function (err, ride) {
      if (err) {
        callback(err, null);
      } else if (!ride) {
        callback( {msg: 'Invalid ride'} );
      } else {
        var riders = ride.riders;
        callback(null, riders.indexOf(userId));
      }
    });
  };

  that.getAllOpenRides = function(callback) {
    var now = new Date();
    rideModel.find({})
      .where('remaining_capacity').gte(1)
      .where('departure_time').gte(now)
      .exec(function(err, rides) {
        if (err) {
          callback(err);
        } else {
          callback(null, rides);
        }
      });
  };

  // TODO: Use Google Maps API to find rides by location
  that.findRidesByPickup = function(location, callback) {
    var now = new Date();
    rideModel.find({ origin: location }).where('departure_time').gte(now).exec(function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  // TODO: Use Google Maps API to find rides by location
  that.findRidesByDestination = function(location, callback) {
    var now = new Date();
    rideModel.find({ destination: location }).where('departure_time').gte(now).exec(function(err, rides) {
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
    rideModel.find({}).where('departure_time').gte(now).gte(date).lte(end).exec(function(err, rides) {
      if (err) {
        callback(err);
      } else {
        callback(null, rides);
      }
    });
  };

  // does not check if ride has closed
  that.getRide = function(rideId, callback) {
    rideModel.findById(rideId, function (err, ride) {
      if (err) {
        callback(err);
      } else if (!ride) {
        callback({ msg: 'Invalid ride.' });
      } else {
        callback(null, ride);
      }
    });
  };

  that.addRide = function(userId, origin, destination, departure_time,
                          total_capacity, transport,
                          callback) {
    rideModel.create({
      'origin': origin,
      'destination': destination,
      'departure_time': departure_time,
      'total_capacity': total_capacity,
      'remaining_capacity': total_capacity - 1,
      'riders': [userId],
      'transport': transport,
    }, function(err, ride) {
       if (err) {
         callback(err);
       } else {
        userModel.findByIdAndUpdate(userId,
                                    {$push: {rides: ride._id} },
                                    function (err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          };
        });
      }       
    });
  };

  that.getRiders = function(rideId, callback) {
    rideModel.findById(rideId, function (err, ride) {
      if (err) {
        callback(err, null);
      } else {
        var ridersIds = ride.riders;
        var riderUsernames = [];
        riderIds.forEach(function (err, ride) {
          userModel.getUsername(rideId, function (err, username) {
            if (err) {
              callback(err);
            } else {
              riderUsernames.push(username);
            }
          });
        });
        callback(null, riderUsernames);
      }
    });
  };

  that.addRider = function(rideId, riderId, callback) {
    // checks if ride is full
    rideModel.findById(rideId, function(err, ride) {
      if (!ride) {
        callback({ msg: 'Invalid ride.' });
      } else if (ride.remaining_capacity === 0) {
        callback( { msg: "ride full" } );
      } else {
        rideModel.findByIdAndUpdate(rideId, { $inc: {'remaining_capacity' : -1} }, function(err, result) {
          rideModel.findByIdAndUpdate(rideId, { $push: { riders: riderId } }, function(err, result) {
            if (err) {
              callback(err);
            } else{
              userModel.findByIdAndUpdate(riderId,
                                           { $push: {rides: rideId } },
                                           function (err, result) {
                if (err) {
                  callback(err,null);
                } else {
                  callback(null,null);
                }
              });
            }
          });
        });
      }
    });
  };

  that.removeRider = function(rideId, riderId, callback) {
    var ObjectId = mongoose.Types.ObjectId;
    rideModel.findByIdAndUpdate(rideId,
                                 { $inc: { 'remaining_capacity' : 1 } },
                                 function (err, result) {
      if (err) {
        callback(err, null);
      } else {
        rideModel.findByIdAndUpdate(rideId,
                                    { $pull: { riders: ObjectId(riderId) } },
                                    function(err, result) {
          if (err) {
            callback(err)
          } else {
            userModel.findByIdAndUpdate(riderId,
                                        { $pull: {rides: ObjectId(rideId) } },
                                        function (err, result) {
              if (err) {
                callback(err,null);
              } else {
                //delete ride if no more riders
                rideModel.findById(rideId, function (err, ride) {
                  if (ride.remaining_capacity === ride.total_capacity) {
                    that.deleteRide(rideId, function(err) {
                      if (err) {
                        callback(err, null);
                      } else {
                        callback(null, null);
                      }
                    });
                  } else {
                    callback(null,null);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  that.deleteRide = function(rideId, callback) {
    rideModel.findByIdAndRemove(rideId, function(err) {
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
