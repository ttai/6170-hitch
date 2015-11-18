//Data model which represents a user
var mongoose = require("mongoose");
var schemas = require("./schemas");
var userSchema = schemas.userSchema;
var Review = require('./Review');
var Ride = require('./Ride');

var User = (function User() {

  var that = Object.create(User.prototype);
  //returns the user object if it exists

  that.userExists = function(currentKerberos,callback){
    userSchema.find({kerberos: currentKerberos}, function(err, user){
    if (err){
      doesExist= err;
    }
    else if (user == null){
      doesExist=false;
    }
    else{
      doesExist=true;
    }
    callback(doesExist,user);
  });
  }

  //password or certificate authentication 
  that.createUser = function(currentKerberos, callback){
    userExists(currentKerberos,function(doesExist, user){
      if (doesExist){
        callback("username taken");
      }else if(currentKerberos===""){
        callback("invalid");
      }else{
        userSchema.create({"kerberos": currentKerberos}, function(e, info){
          if (e){
            callback("error");
          }else{
            callback("valid");
          }
        });
      }     
    })
  }

  // Adds a user to a specific ride
  that.joinRide= function(currentKerberos, ride1, callback){
    userExists(currentKerberos,function(doesExist, user){
      if (doesExist){
        Ride.update({"ride": ride1}, {$push: {"riders": user}}, function(e){});
      }
    }); 
  }

  // Deletes a user from a specific ride
  that.leaveRide=function(currentKerberos, ride, callback){
    userExists(currentKerberos,function(doesExist, user){
      if (doesExist){
        Ride.update({"ride": ride1}, {$pull: {"riders": user}}, function(e){});
      }
    }); 
  }

  // Give a list of all reviews given to a user
  that.getReviews=function(currentKerberos, callback){
    userExists(currentKerberos,function(doesExist, user){
      if (doesExist) {
        Review.find({ '_id': user.reviews }, function(err, reviews){
          callback(reviews);
        })
      }
    }); 
  }

  // Gives the user's average rating.
  that.getUserRating=function(currentKerberos, callback){
    userExists(currentKerberos,function(doesExist,user){
      if (doesExist){
        callback(user.rating);
      }
    })
  }


  // do add review!
  that.addReview=function(currentKerberos,review,callback){
    userExists(currentKerberos, function(doesExist,user){
      if (doesExist){
        userSchema.update({"kerberos": currentKerberos}, {$push: {"reviews": review}}, function(e){});
      }
    })
  }


  Object.freeze(that);
  return that;
})();



//var User = mongoose.model("User",userSchema);
//User.create({username:"all",password:"pass", tweets:[]});
module.exports = User;