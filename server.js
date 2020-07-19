const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const { check, validationResult } = require("express-validator");
const bodyParser = require('body-parser')
const path = require("path")
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2
const passport = require('passport');
const passportConfig = require('./config/passport');
const sendEmail = require("./middleware/sendEmail");

const app = express()
if (process.env.NODE_ENV === "production") {
    app.use(express.static("build"));
  }

//Initialize passport
  app.use(passport.initialize());
//connect to DB
mongoose.connect(process.env.dbConnectCloud, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(()=>console.log('Connected to DB'))
  .catch(err=>console.log(err))

//configure body parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//Set uploads folder as static
app.use('/uploads', express.static('uploads'));

//set routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.get("/", (req, res)=>res.json({msg:"Welcome to Aidhub"}))



//handle every other request
app.get('/*', (req, res)=> {
    res.sendFile(path.join(__dirname, 'build/index.html'), (err)=> {
      if (err) {
        res.sendFile(path.join(__dirname, 'build/index.html'))
      }
    })
  })


app.listen(process.env.PORT || 5000, ()=>{ console.log(`Server started on port ${process.env.PORT || 5000}`)})