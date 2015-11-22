// Data model which represents a user
var mongoose = require("mongoose");
var schemas = require("./schemas");
var userSchema = schemas.userSchema;
var Review = require('./Review');
var Ride = require('./Ride');

var User = (function User() {

  var that = Object.create(User.prototype);

  // password or certificate authentication 
  that.createUser = function(currentKerberos, callback){
    userSchema.count({kerberos:currentKerberos}, function (err, count) {
      if (currentKerberos === "") {
        callback(err);
      } else if (count > 0) {
        callback(null, { taken: true });
      } else {
        userSchema.create({"kerberos": currentKerberos, rating: 5, reviews: [], rides: []}, function(e, user) {
          if (e) {
            callback(e);
          } else {
            callback(null, user);
          }
        });
      }     
    });
  };

  // Verify password for login
  that.verifyPassword = function(userId, candidatepw, callback) {
    userSchema.find({ '_id': userId }, function(err, user) {
      if (err) {
        callback(err);
      } else if (user.password === candidatepw) {
        callback(null, user);
      } else {
        callback(null, false);
      }
    });
  };

  // Adds a user to a specific ride
  that.joinRide = function(userId, ride1, callback) {
    Ride.update({"ride": ride1}, {$push: {"riders": userId}}, function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null, null)
      }
    });
  };

  // Deletes a user from a specific ride
  that.leaveRide = function(userId, ride, callback) {
    Ride.update({"ride": ride1}, {$pull: {"riders": userId}}, function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null, null)
      }
    });
  };

  // Give a list of all reviews given to a user
  that.getReviews = function(userId, callback) {
    userSchema.find({ '_id': userId }, function(err, user){
      if (err) {
        callback(err);
      } else {
        callback(null, user.reviews);
      }
    })
  };

  // Gives the user's average rating.
  that.getUserRating = function(userId, callback) {
    userSchema.find({ '_id': userId }, function(err, user) {
      if (err) {
        callback(err);
      } else {
        callback(null, user.rating);
      }
    });
  };


  // do add review!
  that.addReview = function(userId, review, callback) {
    userSchema.find({ "_id": userId }, function(err, user) {
      if (err) {
        callback(err);
      }
      var n_reviews = user.reviews.length;
      var new_rating = (user.rating * n_reviews + review.rating) / (n_reviews + 1);
      userSchema.update({ "_id": userId },
                        { $set: { "rating": new_rating },
                          $push: { "reviews": review._id } },
                        function(err) {
        if (err) {
          callback(err);
        } else {
          callback(null, null);
        }
      });
    });
  };

  Object.freeze(that);
  return that;
})();

module.exports = User;
