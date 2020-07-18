const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    uniqueid:String,
    name : {
        type : String,
        required : true
    },
    email : String,
    username:String,
    password : String,
    phone : String,
    googleId : String,
    facebookId : String,
    activated: {
        type: Boolean,
        default: false
      },
    authType : {
        type : String,
        required : true
    },
    avatar:{
        type:Object,
        default: {path:"uploads/avatar/aidhub.io-defaultavatar-23022020.png"}
    },
    avatarhost:{
        type:String,
        default: "local"
    },
    created : {
        type : Date,
        default : Date.now
    }

})

module.exports = User = mongoose.model('user', UserSchema);