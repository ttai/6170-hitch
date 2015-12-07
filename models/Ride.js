var mongoose = require('mongoose');
var schemas = require('./schemas');
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var reviewModel = schemas.reviewModel;
var ObjectId = mongoose.Types.ObjectId;

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

  // finds rides within a given radius of both origin and destination
  that.findRidesbyLocation = function(origin_lng, origin_lat, origin_max, dest_lng, dest_lat, dest_max) {
    var div_by = (3959 * Math.PI)/(180 * 2.5);
    var origin = [];
    var dest = [];
    origin[0] = origin_lng;
    origin[1] = origin_lat;
    dest[0] = dest_lng;
    dest[1] = dest_lat;
    origin_max = 1;
    dest_max = 1;
    origin_max /= div_by;
    dest_max /= div_by;
    rideModel.find({ origin_coord: {$near: origin, $maxDistance: origin_max} },
    { dest_coord: { $near: dest, $maxDistance: dest_max }})
    .where('departure_time').gte(now).exec(function(err, rides) {
      if (err) {
        callback(err);
      } else {
        var getDistance = function(ride_origin, ride_dest) {
          ride_origin_lng = ride_origin[0];
          ride_origin_lat = ride_origin[1];
          ride_dest_lng = ride_dest[0];
          ride_dest_lat = ride_dest[1];
          origin_dist = Math.pow((ride_origin_lng - origin[0]), 2) + Math.pow((ride_origin_lat - origin[1]), 2);
          dest_dist = Math.pow((ride_dest_lng - dest[0]), 2) + Math.pow((ride_dest_lat - dest[1]), 2);
          return origin_dist + dest_dist;
        }
        var sortByDistance = function (a, b) {
          if (getDistance(a.origin_coord, a.dest_coord) < getDistance(b.origin_coord, b.dest_coord)) {
            return -1;
          } else if (getDistance(a.origin_coord, a.dest_coord) > getDistance(b.origin_coord, b.dest_coord)) {
            return 1;
          } else {
            return 0;
          }
        }
        rides.sort(sortByDistance);
        callback(null, rides);
      };
    });
  };


    


  // TODO: this is not used anywhere
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
                          origin_coord, dest_coord, distance, duration,
                          total_capacity, transport,
                          callback) {
    rideModel.create({
      'origin': origin,
      'destination': destination,
      'departure_time': departure_time,
      'origin_coord': origin_coord,
      'dest_coord': dest_coord,
      'distance': distance,
      'duration': duration,
      'total_capacity': total_capacity,
      'remaining_capacity': total_capacity - 1,
      'riders': [userId],
      'creator': userId,
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
            callback(null,ride);
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
        var riderIds = ride.riders;
        userModel.find({ '_id' : { $in : riderIds } }, function(err, riders) {
          callback(err, riders);
        });
      }
    });
  };

  that.getOtherRiders = function(rideId, userId, callback) {
    that.getRiders(rideId, function(err, riders) {
      var user_id = ObjectId(userId);
      var other_riders = riders.filter(function(rider) {
        return !user_id.equals(rider._id);
      });
      var other_riders_copy = other_riders.slice(0);
      var other_riders_reviews = [];
      (function next(){
        if (!other_riders_copy.length) {
          return callback(null, other_riders, other_riders_reviews);
        }
        var other_rider = other_riders_copy.shift();
        reviewModel.find({ride: rideId, reviewer: userId, reviewee: other_rider._id}, function(err, review) {
          if (err) {
            return callback(err);
          } else {
            if (review.length > 0) {
              other_riders_reviews.push(review[0]);
            } else {
              other_riders_reviews.push(null);
            }
            next();
          }
        })
      })();
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
                    if (ride.creator === riderId) {
                      rideModel.findByIdAndUpdate(rideId, { $set: {creator: undefined } },
                                                  function (err, result) {
                        if (err) {
                          callback(err, null);
                        } else {
                          callback(null, null);
                        }
                      });
                    } else {
                      callback(null, null);
                    }
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
