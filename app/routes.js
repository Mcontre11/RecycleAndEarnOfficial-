module.exports = function (app, passport, db) {


  app.get('/', function (req, res) {
    res.render('home.ejs');
  });

 
  app.get('/profile', isLoggedIn, function(req, res) {
    console.log(req.user._id)
    db.collection('users').find({ _id: req.user._id }, (err, result) => {
        if (err) return console.log(err)
        console.log('profileWorking',result)
        res.render('userAccount.ejs', {
          user: req.user,
          EarnedPoints: result.EarnedPoints,
          email:req.user.local.email
        })
        
        console.log('req.user.local.email')
      })
  });

 app.get('/board', function(req, res){
     // '/./'is a regular expression that matches any string with atleast 1 character, we are using it to tell mongoose to give any document whos barcode properry has atleast 1 character this function 
   // the qr codes do not get affected because they dont have barcode properrty 
   db.collection('codes').find({barCode: /./}).toArray((err,result) => 
   {
    console.log(result)
    if (err) return console.log(err)
    const barCodeCount = {}
    for (let i = 0; i < result.length; i++){
    const currentBarCode = result[i].barCode
    if (
      // these conditionals add a counter of 1 each time a barcode already in the database is found and it also adds a barcode and the = 1 when it is a new barcode. 
      barCodeCount[currentBarCode] 
    ){
      barCodeCount[currentBarCode]++
    } else{
      barCodeCount[currentBarCode] = 1 
    }
    }
    console.log(barCodeCount,'barCodeCount',typeof(barCodeCount))

    res.render('leaderBoard.ejs', {
     barCodeCount: barCodeCount
    })   
   }  );
 } );
// ^^^ WHAT I WOULD LIKE TO ADD IS A FUNCTION THAT DISPLAYS THE BRAND TO BE DISPLAYED INSTEAD OF THE BARCODE NUNBER ^^^


//recycle station location 
app.get('/locations', function (req, res) {
  db.collection('locations').find().toArray((err, result) => {
      console.log(result)
      if (err) return console.log(err)
      res.send( {
        locations: result
    })
  })
});

// These are just the route names I decided to render
  app.get('/home', function (req, res) {
    res.render('home.ejs');
  });
  app.get('/about', function (req, res) {
    res.render('about.ejs');
  });

  app.get('/sponsor', function (req, res) {
    res.render('sponsor.ejs');
  });


  app.get('/other', function (req, res) {
    res.render('other.ejs');
  });
 
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/QRcode', isLoggedIn, (req, res) => {
    console.log('QRcode',req.body)
    console.log (req.user)
   
    db.collection('codes').insertOne({QRcode: req.body.QRcode, user: req.user._id}, 
      (err, result) => {
        if (err) return console.log(err)
      console.log(result)
      console.log('QRcodeSavedToDataBase, ', req.body.QRcode)
        db.collection('codes').insertOne({barCode: req.body.barCode, user: req.user._id},
          (err, result) => {
            if (err) return console.log(err)
            console.log(result)
            console.log('barCodeSavedToDataBase, ', req.body.barCode)
            db.collection('users')
            .findOneAndUpdate({_id: req.user._id},{
                  $inc: {
                    EarnedPoints:2
                  }
                }, {
                  sort: {_id: -1},
                  upsert: true
                }, (err, result) => {
                  if (err) return res.send(err)
                  res.send({ status: 'true' })
                })
              })
          
          })
    })
     //^^^^  WHAT I WOULD LIKE TO ADD IS A FUNCTION THAT CREATES DIFFERENT POINTS ACCORDING TO THE LOCATION. EXAMPLE BEACHES CAN HAVE A HIGHER POINT SYSTEM. ^^^


  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', 
    failureRedirect: '/login', 
    failureFlash: true 
  }));

 
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', 
    failureRedirect: '/signup', 
    failureFlash: true 
  }));

  
  // local info
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
