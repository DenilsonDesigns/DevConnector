const express = require("express");
const router = express.Router();

//GET- api/users/test
//Tests post route
//Access- public
router.get("/test", (req, res) => {
  res.json({ msg: "Users works" });
});

module.exports = router;
