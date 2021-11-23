module.exports = function (app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  // app is my application/server/api (the app is listening for the type of request and the endpoint)
  // get / post / put / delete / update* are my crud actions/requests type 
  // the first parameter of my request type (ex. "/endpoint") is my endpoint aka route name 
  app.get('/profile', isLoggedIn, function(req, res) {
    console.log(req.user._id)
      db.collection('codes').find({createdBy: req.user._id}).toArray((err, result) => {
        if (err) return console.log(err)
        console.log('profileWorking',result)
        res.render('userAccount.ejs', {
          user: req.user,
          earnedPoints: result,
          email:req.user.local.email
        })
        
        console.log('req.user.local.email')
      })
  });
  app.get('/home', function (req, res) {
    res.render('home.ejs');
  });
  app.get('/about', function (req, res) {
    res.render('about.ejs');
  });

  app.get('/sponsor', function (req, res) {
    res.render('sponsor.ejs');
  });

 
  // app.get('/userAccount', function(req, res) {
  //   res.render('userAccount.ejs');
  // });

  app.get('/other', function (req, res) {
    res.render('other.ejs');
  });
  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // message board routes ===============================================================




  app.post('/barCode', (req, res) => {
    console.log('BARCODE',req.body)
    console.log (req.user)
    db.collection('codes').save({ barCode: req.body.barCode, user: req.body.userID }, (err, result) => {
      if (err) return console.log(err)
      console.log('barCodeSavedToDataBase, ', req.body.barCode)
      res.send({ status: 'true' })
    })
  })


  app.post('/QRcode', (req, res) => {
    console.log('req.body', req.body),
      // we are adding a get in order to find the time stamp object in the collection in order to stop the multiple qr readers
      //%$ is used to not equal the value 
      db.collection('codes').find({ QRcode: { $ne: null }, timeStamp: { $ne: null } }).toArray((findErr, QRcodes) => {
        if (findErr) return console.log(findErr)

        // we create this variable in order to sort variables and we compare a, b which are the qr codes 
        // after the fat arrow means that the first element in the qr code is one that is saved 
        let sortedQRcodes = QRcodes.sort((a, b) => b.timeStamp - a.timeStamp)
        let somethingHasBeenScanned;
        if (sortedQRcodes.length == 0) {
          somethingHasBeenScanned = false;
        } else {
          somethingHasBeenScanned = true;
        }

        // These "nested" conditions are all about guarding against the case
        // where multiple QR codes are uploaded in rapid succession. Our
        // strategy is to check whether a QR code has been uploaded in the
        // last 60 seconds, and if so, ignore the request.
        // We can only check for the latest QR code if there are any QR codes
        // in the database to begin with. That's what the "outer" condition is
        // verifying.
        if (somethingHasBeenScanned) {
          // we are checking if the most recent entry was less than a minute we do not save
          if (Date.now() - sortedQRcodes[0].timeStamp <= 60000) {
            console.log('tooSoon')
            res.send([]);
            return;
          }
        }

        db.collection('codes').save({ QRcode: req.body.QRcode, timeStamp: Date.now() }, (err, result) => {
          if (err) return console.log(err)
          console.log('QRcodeSavedToDataBase, ', req.body.QRcode)
          res.send({ status: 'true' })
        })
      })
  })



  //  ADDING POINTS HERE?

  // app.put('/pointsCount', (req, res) => {
  //   db.collection('earnedPoints')
  //   if (err) return console.log(err)
  //   console.log('barCodeSavedToDataBase, ', req.body.barCode)
  //   res.send({ status: 'true' })
  //     .findOneAndUpdate({ points: req.user._id }, {
  //       $set: {
  //         points: req.user_id + 1
  //       }
  //     }, {
  //       sort: { _id: -1 },
  //       upsert: true
  //     }, (err, result) => {
  //       if (err) return res.send(err)
  //       res.send(result)
  //     })
  // })

  // app.put('/downVote', (req, res) => {
  //   db.collection('messages')
  //   .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
  //     $set: {
  //       thumbUp:req.body.thumbDown - 1 
  //     }
  //   }, {
  //     sort: {_id: -1},
  //     upsert: true
  //   }, (err, result) => {
  //     if (err) return res.send(err)
  //     res.send(result)
  //   })
  // })

  // app.delete('/messages', (req, res) => {
  //   db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
  //     if (err) return res.send(500, err)
  //     res.send('Message deleted!')
  //   })
  // })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
