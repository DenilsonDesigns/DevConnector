const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//LOAD VALIDATION
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load profile model
const Profile = require("../../models/Profile");
//Load user model
const User = require("../../models/User");

//GET- api/profile/test
//Tests post route
//Access- public
router.get("/test", (req, res) => {
  res.json({ msg: "Profile works" });
});

//GET- api/profile
//Get current users profile
//Access- private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

//GET- api/profile/all
//GET get all profiles
//Access- public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: "There is no profiles" }));
});

//GET- api/profile/handle/:handle
//GET profile by handle
//Access- public
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//GET- api/profile/user/:user_id
//GET profile by user ID
//Access- public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

//POST- api/profile
//Create Or Edit User Profile
//Access- private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //CHECK VALIDATIOn
    if (!isValid) {
      //RETURN ANY ERRORS WITH 400
      return res.status(400).json(errors);
    }
    //GET FIELDS
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //SKILLS SPLIT INTO AN ARRAY
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //SOCIAL
    profileFields.social = {};

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //UPDATE
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => {
          res.json(profile);
        });
      } else {
        //CREATE

        //CHECK IF HANDLE EXISTS
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          //SAVE PROFILE
          new Profile(profileFields).save().then(profile => {
            res.json(profile);
          });
        });
      }
    });
  }
);

//POST- api/profile/experience
//Add experience to profile
//Access- private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //VALIDATE POSRT REQUEST
    const { errors, isValid } = validateExperienceInput(req.body);

    //CHECK VALIDATIOn
    if (!isValid) {
      //RETURN ANY ERRORS WITH 400
      return res.status(400).json(errors);
    }
    //SEARCH MONGO COLLECTION FOR EXPERIENC OF USER
    Profile.findOne({ user: req.user.id }).then(profile => {
      //ADDING NEW EXPERIENCE FROM BODY
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //ADD TO EXPERIENCE ARRAY
      profile.experience.unshift(newExp);
      profile.save().then(profile => {
        res.json(profile);
      });
    });
  }
);

//POST- api/profile/education
//Add education to profile
//Access- private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //VALIDATE POSRT REQUEST
    const { errors, isValid } = validateEducationInput(req.body);

    //CHECK VALIDATIOn
    if (!isValid) {
      //RETURN ANY ERRORS WITH 400
      return res.status(400).json(errors);
    }
    //SEARCH MONGO COLLECTION FOR EXPERIENC OF USER
    Profile.findOne({ user: req.user.id }).then(profile => {
      //ADDING NEW EXPERIENCE FROM BODY
      const newEdu = {
        school: req.body.degree,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //ADD TO EXPERIENCE ARRAY
      profile.education.unshift(newEdu);
      profile.save().then(profile => {
        res.json(profile);
      });
    });
  }
);

//DELETE- api/profile/experience/:exp_id
//Delete experience from profile
//Access- private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //SEARCH MONGO FOR USER PROFILE FIRST
    Profile.findOne({ user: req.user.id }).then(profile => {
      //GET REMOVE INDEX
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //SPLICE OUT OF ARRAY
      profile.experience.splice(removeIndex, 1);

      //SAVE
      profile
        .save()
        .then(profile => {
          res.json(profile);
        })
        .catch(err => res.status(404).json(err));
    });
  }
);

//DELETE- api/profile/education/:edu_id
//Delete education from profile
//Access- private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //SEARCH MONGO FOR USER PROFILE FIRST
    Profile.findOne({ user: req.user.id }).then(profile => {
      //GET REMOVE INDEX
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      //SPLICE OUT OF ARRAY
      profile.education.splice(removeIndex, 1);

      //SAVE
      profile
        .save()
        .then(profile => {
          res.json(profile);
        })
        .catch(err => res.status(404).json(err));
    });
  }
);

//DELETE- api/profile
//Delete user and profile
//Access- private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndDelete({ user: req.user.id }).then(() => {
      User.findOneAndDelete({ _id: req.user.id }).then(() => {
        res.json({ success: true });
      });
    });
  }
);

module.exports = router;
