var express = require("express");
const {
  handleEsewaSuccess,
  handleEsewaFailure,
  createOrder,
} = require("../controllers/esewaController");
var router = express.Router();

// Route to handle the successful payment from Esewa
router.get("/success", handleEsewaSuccess);

// Route to create a new order and initiate the payment process
router.post("/create", createOrder);

// Route to handle the failed payment from Esewa
router.get("/failure", handleEsewaFailure);

module.exports = router;
