const express = require("express");
const contactControllers = require("../controllers/contactControllers");
const { authGuard, adminGuard } = require("../middleware/authGuard");

const router = express.Router();

// Route to create a new contact
router.post("/contacts",authGuard,contactControllers.createContact);

// Route to fetch all contacts
router.get("/get_all_contacts",adminGuard,contactControllers.getAllContacts );

module.exports = router;
