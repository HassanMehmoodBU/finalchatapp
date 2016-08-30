module.exports = function(passport, FacebookStrategy, config, mongoose){

  // Attributes for MongoDB
  var chatUser = new mongoose.Schema({
    profileID:String,
    fullname:String,
    profilePic:String
  });

  // User model
  var userModel = mongoose.model('chatUser', chatUser);

  // Stores a particular user's reference in the session (available accross session).
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  // When data is needed about a user.
  passport.deserializeUser(function(id, done){
    userModel.findById(id, function(err, user){
      done(err, user);
    });
  });

    passport.use(new FacebookStrategy({
      clientID: config.fb.appID,
      clientSecret: config.fb.appSecret,
      callbackURL: config.fb.callbackURL,
      profileFields: ['id', 'displayName', 'photos']
    }, function(accessToken, refreshToken, profile, done){
    	console.log(""+config.fb.appID)
      //Check if the user exists in our MongoDB
      userModel.findOne({'profileID':profile.id}, function(err, result){
        if(result){
        	console.log("got the id"+result.fullname);
          //console.log("got the name"+fullname);
          // if the user exists, return the profile
          done(null, result);
        } else {
        	console.log("creating the id");
            // if not, create one, then return profile
            var newChatUser = new userModel({
              profileID: profile.id,
              fullname: profile.displayName,
              profilePic: profile.photos[0].value || ''
            });
            // Save the user
            newChatUser.save(function(err){
              done(null, newChatUser);
            })
        }

      }); // Returns ONE record
    }));
}
