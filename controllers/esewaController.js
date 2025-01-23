// const crypto = require("crypto");
// const {v4} = require("uuid");

// exports.handleEsewaSuccess = async (req, res, next) => {
//   try {
//     const { data } = req.query;

//     // Decode the base64-encoded query data
//     const decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
//     console.log("Decoded Data:", decodedData);

//     if (decodedData.status !== "COMPLETE") {
//       return res.status(400).json({ message: "Error in payment status" });
//     }

//     // Construct the message for signature comparison
//     const message = decodedData.signed_field_names
//       .split(",")
//       .map((field) => `${field}=${decodedData[field] || ""}`)
//       .join(",");
//     console.log("Generated Message:", message);

//     // Generate signature using the secret key
//     const signature = this.createSignature(message);
//     console.log("Generated Signature:", signature);

//     // Verify if the signature from the payment gateway matches the generated one
//     if (signature !== decodedData.signature) {
//       return res.status(400).json({ message: "Integrity error: Signature mismatch" });
//     }

//     console.log("Payment success from backend");

//     // Proceed to confirm the order or do any necessary post-processing here
//     res.redirect("http://localhost:3000/success"); // Redirect to success page after successful payment
//   } catch (err) {
//     console.error(err);
//     return res.status(400).json({ error: err?.message || "Error processing the payment" });
//   }
// };

// exports.handleEsewaFailure = async (req, res, next) => {
//   // If payment fails, redirect to failure page
//   res.redirect("http://localhost:3000/failure");
// };

// exports.createOrder = async (req, res) => {
//   try {
//     const order = req.body;
//     const orderId = v4(); // Create a unique transaction ID
//     console.log("Order Data:", order);

//     // Create the message for the signature
//     const message = `total_amount=${order.amount},transaction_uuid=${orderId},product_code=EPAYTEST`;

//     // Generate the signature for the payment request
//     const signature = this.createSignature(message);
//     console.log("Signature for the Order:", signature);

//     // Create the form data to send to Esewa for initiating the payment
//     const formData = {
//       amount: order.amount,
//       failure_url: "http://localhost:5000/api/esewa/failure", // Failure URL for the transaction
//       product_delivery_charge: "0",
//       product_service_charge: "0",
//       product_code: "EPAYTEST",
//       signature: signature,
//       signed_field_names: "total_amount,transaction_uuid,product_code", // Fields to sign
//       success_url: "http://localhost:5000/api/esewa/success", // Success URL after successful payment
//       tax_amount: "0",
//       total_amount: order.amount,
//       transaction_uuid: orderId,
//     };

//     // Return the form data to be used for submitting the payment request
//     return res.json({
//       message: "Order Created Successfully",
//       order,
//       payment_method: "esewa",
//       formData,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(400).json({ error: err?.message || "Error creating the order" });
//   }
// };

// exports.createSignature = (message) => {
//   const secret = "8gBm/:&EnhH.1/q"; // Secret key (use the correct secret key in production)
  
//   // Create the HMAC-SHA256 hash using the secret key
//   const hmac = crypto.createHmac("sha256", secret);
//   hmac.update(message);

//   // Return the hash in base64 format
//   return hmac.digest("base64");
// };

const crypto = require("crypto");
// const Project = require("../models/project");
// const User = require("../models/user");
const { v4 } = require("uuid");
// const Investor = require("../models/investor");



exports.createOrder = async (req, res, next) => {
  const { amount } = req.body;
  const projectId = req.params.id + "-" + v4();
  console.log(
    "The project id and invest amount  is ",
    projectId,
    amount,
  );
  const signature = this.createSignature(
    `total_amount=${amount},transaction_uuid=${projectId},product_code=EPAYTEST`,
  );
  const formData = {
    amount: amount,
    failure_url: "http://localhost:5000/api/esewa/failure",
    product_delivery_charge: "0",
    product_service_charge: "0",
    product_code: "EPAYTEST",
    signature: signature,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    success_url: "http://localhost:5000/api/esewa/success",
    tax_amount: "0",
    total_amount: amount,
    transaction_uuid: projectId,
  };

  res.json({
    message: "Order Created Sucessfully",
    formData,
    payment_method: "esewa",
  });
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { data } = req.query;
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8"),
    );
    console.log(decodedData);

    if (decodedData.status !== "COMPLETE") {
      return res.status(400).json({ message: "errror" });
    }
    const message = decodedData.signed_field_names
      .split(",")
      .map((field) => `${field}=${decodedData[field] || ""}`)
      .join(",");
    console.log(message);

    const projectId = decodedData.transaction_uuid.split("-")[0];
    const decodedArray = decodedData.transaction_uuid.split("-");
    // const userId = decodedArray[decodedArray.length - 1];
    // console.log("The project id is " + projectId);

    if (decodedData.status !== "COMPLETE") {
      console.log("The status is not complete");
      // return res.status(400).json({ message: "Error in payment status" });
      return res.redirect(`http://localhost:3000/failure`);
      // return res.redirect(`http://localhost:5173/projects/${projectId}`);
    }
    // const project = await Project.findById(projectId);
    // const investedAmount = parseFloat(
    //   decodedData.total_amount.replace(/,/g, ""),
    // );
    // console.log("The investment amount is " + investedAmount);

    // if (!project) {
    //   return res
    //     .status(400)
    //     .json({ message: "Please provide a valid project id" });
    // }

    // project.investedAmount = project.investedAmount + investedAmount;

    // await project.save();

    // const newInvestor = new Investor({
    //   projectId,
    //   investorId: userId,
    //   investedAmount,
    // });

    // await newInvestor.save();

    res.redirect("http://localhost:3000/success");
  } catch (err) {
    console.log(err.message);
    return res.status(400).json({ error: err?.message || "No Orders found" });
  }
};

exports.createSignature = (message) => {
  const secret = "8gBm/:&EnhH.1/q";
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);

  // Get the digest in base64 format
  const hashInBase64 = hmac.digest("base64");
  return hashInBase64;
};


 