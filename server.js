"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const passport = require('passport');
const session =  require('express-session');

const app = express();

const assert = require('assert');

const auth = require('./auth.js');
const routes = require('./routes.js');

const mongo = require('mongodb').MongoClient;

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.set('view engine', 'pug');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongo.connect(process.env.DATABASE,{ useNewUrlParser : true , useUnifiedTopology: true }, (err, client) => {
  assert.equal(null, err);
  if(err) {
    console.log('Database error: ' + err);
  } else {
    console.log('Successful database connection');
    const db = client.db('users');
    
    auth(app, db);
    routes(app, db); 
    

    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }
});







