const Contact = require("../models/contactModels");

// Create a new contact
const createContact = async (req, res) => {
  console.log("Create contact API hit");
  const { name, email, phone, message } = req.body;

  // Validation
  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Save the contact request to the database
    const newContact = new Contact({ name, email, phone, message });
    const contact = await newContact.save();

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get all contacts
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Contacts fetched successfully",
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
};
