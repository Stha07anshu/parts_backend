const nodemailer = require("nodemailer");
const Contact = require("../models/contactModels");
require('dotenv').config();  // To load environment variables from the .env file

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

    // Create a thank you message with HTML and CSS styling
    const thankYouMessage = `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f3f4f6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 80%;
            margin: auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            color: #1e3d58;
            margin-bottom: 20px;
          }
          .content {
            font-size: 16px;
            line-height: 1.5;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #555;
            font-size: 14px;
          }
          .contact-info {
            font-weight: bold;
            color: #1e3d58;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Contacting Gear Up Auto Suppliers!</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to us. We appreciate your inquiry and would like to let you know that our team will get back to you as soon as possible.</p>
            <p>If you have any urgent questions, feel free to contact us at the number below:</p>
            <p class="contact-info">+977-9807654321</p>
            <p>We look forward to assisting you with your needs!</p>
          </div>
          <div class="footer">
            <p>Best regards,</p>
            <p><strong>Gear Up Auto Suppliers Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send a thank you email to the user
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,  // sender address
      to: email,                    // recipient address (user's email)
      subject: 'Thank you for contacting Gear Up Auto Suppliers!',
      html: thankYouMessage,         // HTML body
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: contact,
      thankYouMessage: thankYouMessage,  // Include the thank you message in the response
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
