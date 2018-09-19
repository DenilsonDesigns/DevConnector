const express = require("express");
const router = express.Router();

//GET- api/posts/test
//Tests post route
//Access- public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts works" });
});

module.exports = router;
