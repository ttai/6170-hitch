// Data model which represents a user
var mongoose = require("mongoose");
var schemas = require("./schemas");
var userModel = schemas.userModel;
var rideModel = schemas.rideModel;
var Review = require('./Review');
var Ride = require('./Ride');

var User = (function User() {

  var that = Object.create(User.prototype);

  that.getUser = function (userId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else {
        if (user) {
          callback(null, user);
        } else {
          callback({ msg: 'No such user' });
        }
      }
    });
  };

  that.getKerberos = function (userId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else {
        if (user) {
          callback(null, user.kerberos);
        } else {
          callback({ msg: 'No such user' });
        }
      }
    });
  };

  // password authentication, should be turned into 
  that.createUser = function (currentKerberos, inputPass, callback){
    userModel.count( { kerberos: currentKerberos }, function (err, count) {
      if (currentKerberos === "") {
        callback(err);
      } else if (count > 0) {
        callback({ taken: true });
      } else {
        userModel.create({"kerberos": currentKerberos,
                          "password": inputPass,
                          rating: 5,
                          reviews: [],
                          rides: []
                          },
                          function (err, user) {
                            if (err) {
                              callback(err);
                            } else {
                              callback(null, user);
                            }
                          });
      }
    });
  };

  // Verify password for login
  that.verifyPassword = function (kerberos, candidatepw, callback) {
    userModel.findOne({ 'kerberos' : kerberos }, function (err, user) {
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        if (user.password !== candidatepw) {
            callback(null, false);
          } else {
            callback(null, user); 
          }
      }
    });
  };

  // Give a list of all rides that a user is/was part of
  that.getRides = function (userId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        if (user.rides.length) {
          rideModel.find({ '_id' : { $in: user.rides } }, function (err, rides) {
            if (err) {
              callback(err);
            } else {
              callback(null, rides);
            }
          });
        } else {
          callback(null, []);
        }
      }
    });
  };

  // Give a list of all reviews given to a user
  that.getReviews = function (userId, callback) {
    userModel.findById(userId, function (err, user){
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        callback(null, user.reviews);
      }
    })
  };

  // Gives the user's average rating.
  that.getUserRating = function (userId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        callback(null, user.rating);
      }
    });
  };

  that.updateRating = function (userId, reviewId, callback) {
    userModel.findById(userId, function (err, user) {
      if (err) {
        callback(err);
      } else if (!user) {
        callback({ msg: 'Invalid user' });
      } else {
        var reviews = user.reviews;
        var index = reviews.indexOf(review._id);
        var num_reviews = reviews.length;
        if (index < 0) {
          callback( { msg: 'Invalid review'} );
        } else {
          var new_rating = (user.rating * num_reviews + review.rating - reviews[index]) / (num_reviews);
          userModel.findByIdAndUpdate(userId, 
                                      { $set: {rating: new_rating} },
                                      function (err, result) {
                                        if (err) {
                                          callback(err);
                                        } else {
                                          callback(null, null);
                                        }
                                      });
        }
      }
    });
  };

  // do add review!
  that.addReview = function (userId, review, callback) {
    userModel.findByIdAndUpdate(userId,
                                { $addToSet: {reviews: review._id } },
                                function (err, result) {
                                  if (err) {
                                    callback(err);
                                  } else {
                                    that.updateRating(userId, review._id, function (err, result) {
                                      if (err) {
                                        callback(err);
                                      } else {
                                        callback(null, null);
                                      }
                                    });
                                  }
                                });
  };


  Object.freeze(that);
  return that;
})();

module.exports = User;
