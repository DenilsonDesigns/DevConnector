const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const keys = require("../../config/keys");
const passport = require("passport");

//LOAD INPUT VALIDATION
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//Load User Model
const User = require("../../models/User");

//GET- api/users/test
//Tests post route
//Access- public
router.get("/test", (req, res) => {
  res.json({ msg: "Users works" });
});

//GET- api/users/resgister
//Register a user
//Access- public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exists";
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //SIZE
        r: "pg", //RATING
        d: "mm" //DEFAULT
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              res.json(user);
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//GET- api/users/login
//LOGIN USER/ RETURNING JWT TOKEN
//Access- public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  //FIND USER BY EMAIL
  User.findOne({ email }).then(user => {
    //CHECK FOR USER
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    //CHECK PASSWORD
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //USER MATCHED
        const payload = {
          //CREATE JWT PAYLOAD
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };
        //SIGN TOKEN
        jwt.sign(
          payload,
          process.env.SECRET_OR_KEY,
          // keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "Password Incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

//GET- api/users/current
//Return current user
//Access- private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
