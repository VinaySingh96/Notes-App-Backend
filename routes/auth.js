const express = require('express');
const router = express.Router(); // for various endpoints
const bcrypt = require('bcrypt'); // to secure password
const user = require('../models/users'); // to store user with given schema
const { body, validationResult } = require('express-validator'); //to validate body of req so that it contains required fields
var jwt = require('jsonwebtoken'); // generate access token authontication for various works using access
const fetchUser = require('../middleware/fetchUser'); // middleware so that when we have access token and we directly get user info i.e id directly by only calling it

let JWT_SECRET = "learning authontication"; // can be any string so that any user can't guess this

// Route 1: create a user using POST : /api/auth (doesn't require auth)
router.post('/createUser', [
  body('userName', "User name can not be blank").isLength({ min: 1 }),
  body('userEmail', "enter a valid email id").isEmail(),
  body('userPassword', "Password must be at least 1 characters").isLength({ min: 1 })
], async (req, res) => {
  // console.log(req.body);
  try {
    // to protect the password and save the hashed pass(not meaningfull by looking) to db
    const salt = await bcrypt.genSalt();
    const hashedpass = await bcrypt.hash(req.body.userPassword, salt);
    // intead we can use below line to generate hashed password
    // const hashedpass=await bcrypt.hash(req.body.password, 10) // 10 is default value for creating salt
    const errors = validationResult(req);
    // if there are some errors in body of req
    if (!errors.isEmpty()) {
      // console.log(errors);
      res.send(errors.array());
      return;
    }

    // check weather user with the email already exist
    var User = await user.findOne({ userEmail: req.body.userEmail });
    // if user is already present
    if (User != null) {
      return res.send("Error : User for this email already exists")
    }

    //appropriate way to create user and save to mongo db 
    User=await user.create({
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userPassword: hashedpass
    });
    // .then(user=>{})
    // .catch(err => res.json({ "error": "User for this email already exists" }));

    // using id to create access token 
    const data = {
      user: {
        id: User._id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    // console.log(User);
    res.json({ authToken });
  }
  catch (err) {
    res.status(500).send(err);
  }

})


// Route 2: for login using POST: /api/auth/login
router.post('/login', [
  body('userEmail', "Enter a valid Email").isEmail()
], async (req, res) => {
  const err = validationResult(req);
  if (!err.isEmpty())
    return res.status(400).json({ errors: err.array() });
  const { userEmail, userPassword } = req.body;
  try {
    const vuser = await user.findOne({ userEmail });
    if (vuser == null)
      return res.status(400).json({ 'error': 'wrong credentials' });

    let pass = await bcrypt.compare(userPassword, vuser.userPassword);
    if (!pass)
      return res.status(400).json({ 'error': 'wrong credentials' });
    // console.log(vuser._id);
    const data = {
      user: {
        id: vuser._id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ authToken });

  } catch (error) {
    console.error(error.message);
    res.send("Some Error occured");
  }
})

// Route 3: To display user's Data
router.post('/getUser', fetchUser, async (req, res) => {
  try {
    userId = req.user.id;
    // console.log(userId);
    const usern = await user.findById(userId).select("-userPassword");
    // console.log('Got user');
    res.json(usern)
  } catch (error) {
    console.error(error.message);
    res.send("Internal Server error");
  }

})

module.exports = router;