
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var Fitlog = mongoose.model('Fitlog');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

// Route for pre-loading post objects
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post) {
    if (err) { return next(err); }
    if (!post) {return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

// Route for pre-loading comment objects
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment) {
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});

router.param('username', function(req, res, next, id) {
  var query = User.findById(id);
  query.exec(function(err, username) {
    if (err) {return next(err); }
    if (!username) {return next(new Error('can\'t find user'));}
    req.username = username;
    return next();
  })
});

router.param('fitlog', function(req, res, next, id) {
  var query = Fitlog.findById(id);
  query.exec(function(err, fitlog) {
    if (err) {return next(err);}
    if (!fitlog) {return next(new Error('can\'t find log'));}
    req.fitlog = fitlog;
    return next();
  });
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Fantasy Fitness' });
});

// GET all weekly worksheets for current user
router.get('/:username/fitlog', function(req, res, next) {
  Fitlog.find(function(err, logs) {
    if (err) {
      return next(err);
    }
    res.json(logs);
  });
});

// GET a weekly worksheet with id
router.get('/:username/fitlog/:fitlog', function(req, res, next) {
  res.json(fitlog);
});

// POST a worksheet to the db
router.post('/:username/fitlog', function(req, res, next) {
  var fitlog = new Fitlog(req.body);
  fitlog.save(function(err,fitlog) {
    if(err){ return next(err); }
    res.json(fitlog);
  });
});

// PUT updates in a worksheet with id
//router.put('/:username/fitlog/:fitlog', fitlog, function(req, res, next) {
//  req.fitlog.updateFitlog(function(err, fitlog) {
//    if (err) { return next(err); }
//
//    res.json(fitlog);
//  });
//});


// POST to user registration
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  var user = new User();

  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function (err){
    if(err){
      return next(err); 
    }
    return res.json({token: user.generateJWT()})
  });
});

// POST user login
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

// GET posts page
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){
      return next(err);
    }

    res.json(posts);
  });
});
// GET a post with id
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) {
      return next(err);
    }

    res.json(post);
  });
});

// POST a post to ff_db
router.post('/posts', auth, function(req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;
  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

// POST a comment to ff_db
router.post('/posts/:post/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

// PUT an upvote on a post
router.put('/posts/:post/upvote', auth, function(req, res, next) {
  req.post.upvote(function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});

// PUT an upvote on a comment
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
  req.comment.upvote(function(err, comment) {
    if (err) { return next(err); }

    res.json(comment);
  });
});


module.exports = router;
