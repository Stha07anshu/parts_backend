var express = require("express");
const {
  handleEsewaSuccess,
  handleEsewaFailure,
} = require("../controllers/esewaController");
const { createOrder } = require("../controllers/esewaController");
var router = express.Router();
 
router.get("/success", handleEsewaSuccess);
router.post("/create", createOrder);
router.get("/failure", handleEsewaFailure);
 
module.exports = router;