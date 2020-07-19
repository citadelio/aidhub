const router = require('express').Router();
const protectedRoute = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

// Models
const UserModel = require('../models/User')


router.post('/me',protectedRoute, async(req, res)=>{
    try{
        console.log("here")
        const user = await UserModel.findById(req.userid).select(['-password'])
        console.log(user)
        if(!user){
            return res.json({msg:"User not found", status:false})
        }
        return res.json({user, status:true})
    }
    catch(err){
      return res.json({
        errors: [
          {
            msg: "An error occurred, try again",
            err
          }
        ]
      });
    }
});

module.exports = router;