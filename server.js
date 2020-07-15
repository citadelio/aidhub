const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const app = express()


app.get("/", (req, res)=>res.json({msg:"Welcome to Aidhub"}))

app.listen(process.env.PORT || 5000, ()=>{ console.log(`Server started on port ${process.env.PORT || 5000}`)})