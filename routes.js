'use strict'

// external dependencies
const bcrypt   = require('bcrypt');
const passport = require('passport');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};


module.exports = function (app, db) {

    app.route("/").get((req, res) => {
      //Change the response to render the Pug template
      //res.send(`Pug template is not defined.`);
       res.render(process.cwd() + '/views/pug/index.pug', 
                  {title: 'Home page', message: 'Please login',
                  showLogin: true,
                  showRegistration: true}
                 );
    });    
    
    app.route('/register')
      .post((req, res, next) => {
        db.collection('users').findOne({ username: req.body.username }, function(err, user) {
          if (err) {
            next(err);
          } else if (user) {
            res.redirect('/');
          } else {
            var hash = bcrypt.hashSync(req.body.password, 12);
            db.collection('users').insertOne({
              username: req.body.username,
              //password: req.body.password
              password: hash
            },
              (err, doc) => {
                if (err) {
                  res.redirect('/');
                } else {
                  next(null, user);
                }
              }
            )
          }
        })
      },
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res, next) => {
        res.redirect('/profile');
      }
   );
    
    app.route('/login')
      .post(passport.authenticate('local', { failureRedirect: '/'}), (req,res) =>{
      res.redirect('/profile');
      console.log('User {USERNAME} attempted to log in.');
    });
    
    app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
   });

    app.route('/profile')
      .get(ensureAuthenticated,(req, res) =>{
      //const  username = req.user.username;
      res.render(process.cwd()+ '/views/pug/profile.pug', { username: req.user.username });
    });
  
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
   });           
}
