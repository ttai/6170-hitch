//Data model which represents a user
var mongoose = require("mongoose");
var schemas = require("./schemas");
var userSchema = schemas.userSchema;
var Review = require('./Review');
var Ride = require('./Ride');

var User = (function User() {

  var that = Object.create(User.prototype);
  //returns the user object if it exists

  that.userExists = function(currentId, callback){
    userSchema.find({kerberos: currentKerberos}, function(err, user){
    if (err || user == null){
      callback(false);
    } else {
      callback(true);
    }
  });
  };

  //password or certificate authentication 
  that.createUser = function(currentKerberos, callback){
    userSchema.count({kerberos:currentKerberos}, function (err, count) {
      if (currentKerberos===""){
        callback("Invalid kerberos.");
      } else if (count > 0) {
        callback({ taken: true });
      }else{
        userSchema.create({"kerberos": currentKerberos, rating: 5, reviews: [], rides: []}, function(e, info){
          if (e){
            callback("error");
          }else{
            callback(null);
          }
        });
      }     
    })
  }

  // Adds a user to a specific ride
  that.joinRide= function(userId, ride1, callback){
    userExists(userId,function(doesExist){
      if (doesExist){
        Ride.update({"ride": ride1}, {$push: {"riders": userId}}, function(e){});
      }
    }); 
  }

  // Deletes a user from a specific ride
  that.leaveRide=function(userId, ride, callback){
    userExists(userId,function(doesExist){
      if (doesExist){
        Ride.update({"ride": ride1}, {$pull: {"riders": userId}}, function(e){});
      }
    }); 
  }

  // Give a list of all reviews given to a user
  that.getReviews=function(userId, callback){
    userExists(currentKerberos,function(doesExist){
      if (doesExist) {
        userSchema.find({ '_id': userId }, function(err, user){
          callback(user.reviews);
        })
      }
    }); 
  }

  // Gives the user's average rating.
  that.getUserRating=function(userId, callback){
    userExists(currentKerberos,function(doesExist){
      if (doesExist){
        userSchema.find({ '_id': userId }, function(err, user){
          callback(user.rating);
        });
      }
    });
  };


  // do add review!
  that.addReview=function(userId,review,callback){
    userExists(currentKerberos, function(doesExist){
      if (doesExist){
        userSchema.update({ '_id': userId }, {$push: {"reviews": review}}, function(e){});
      }
    })
  }


  Object.freeze(that);
  return that;
})();



//var User = mongoose.model("User",userSchema);
//User.create({username:"all",password:"pass", tweets:[]});
module.exports = User;