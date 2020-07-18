const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const UserModel = require('../models/User')
const {createUsername} = require('../middleware/helperFunctions')

passport.use(new GoogleStrategy({
    clientID: process.env.google_clientID,
    clientSecret: process.env.google_clientSecret,
    passReqToCallback : true,
    callbackURL: "/auth/google/callback"
  },
  async (req, token, tokenSecret, profile, done) => {
    //Check if user exist in DB
    let user = await UserModel.findOne({googleId: profile.id});
    if(user){
      process.nextTick(()=>{
        user = {...user , isNew : false}
      done(null,user);
      })
    }
    else
    {
      //Create new User
      const newUser = new UserModel({
        name : profile.displayName,
        email : profile._json.email,
        googleId : profile.id,
        username:createUsername(profile.displayName),
        authType : "google",
        activated : true
      })
      //save new User
      let savedUser = await newUser.save();
      if(savedUser){
        process.nextTick(()=>{
          savedUser = {...savedUser , isNew : true}
        done(null, savedUser);
        })
      }
    }
  }
));


passport.use(new FacebookStrategy({
  clientID: process.env.facebook_appID,
  clientSecret: process.env.facebook_appSecret,
  callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
  passReqToCallback : true,
  profileFields: ['id', 'displayName', 'photos', 'email', 'gender', 'name']
},
async (req, token, tokenSecret, profile, done) => {
  //Check if user exist in DB
  let user = await UserModel.findOne({facebookId: profile.id});
  if(user){
    process.nextTick(()=>{
      user = {...user , isNew : false}
    done(null, user)
    })
  }
  else{
    //Create new User
    const newUser = new UserModel({
      name : profile.displayName,
      email : profile._json.email,
      username:createUsername(profile.displayName),
      facebookId : profile.id,
      authType : "facebook",
      activated : true
    })
    //save new User
    let savedUser = await newUser.save();
    if(savedUser){
      process.nextTick(()=>{
        savedUser = {...savedUser , isNew : true}
        done(null, savedUser)
      })
    }
  }
}));

passport.serializeUser((user, done)=>  {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
 done(null, obj);
});
