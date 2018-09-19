const express = require("express");
const router = express.Router();

//GET- api/profile/test
//Tests post route
//Access- public
router.get("/test", (req, res) => {
  res.json({ msg: "Profile works" });
});

module.exports = router;
