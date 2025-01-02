// const axios = require("axios");
const crypto = require("crypto");
 
exports.handleEsewaSuccess = async (req, res, next) => {
  try {
    const { data } = req.query;
    const decodedData = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );
    console.log(decodedData);
 
    if (decodedData.status !== "COMPLETE") {
      return res.status(400).json({ messgae: "errror" });
    }
    const message = decodedData.signed_field_names
      .split(",")
      .map((field) => `${field}=${decodedData[field] || ""}`)
      .join(",");
    console.log(message);
    const signature = this.createSignature(message);
 
    if (signature !== decodedData.signature) {
      res.json({ message: "integrity error" });
    }
    console.log("paymet success from backend");
    res.redirect("http://localhost:3000/success");
 
    // req.transaction_uuid = decodedData.transaction_uuid;
    // req.transaction_code = decodedData.transaction_code;
    // next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err?.message || "No Orders found" });
  }
};
exports.handleEsewaFailure = async (req, res, next) => {
  res.redirect("http://localhost:3000/failure");
};
 
exports.createOrder = async (req, res) => {
  try {
    order = req.body;
    order.id = crypto.randomUUID();
    console.log(order);
    const signature = this.createSignature(
      `total_amount=${order.amount},transaction_uuid=${order.id},product_code=EPAYTEST`
    );
    console.log("signature", signature);
    const formData = {
      amount: order.amount,
      // amount: order.amount,
      failure_url: "http://localhost:5000/api/esewa/failure",
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: "EPAYTEST",
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: "http://localhost:5000/api/esewa/success",
      tax_amount: "0",
      total_amount: order.amount,
      transaction_uuid: order.id,
    };
    return res.json({
      message: "Order Created Sucessfully",
      order,
      payment_method: "esewa",
      formData,
    });
  } catch (err) {
    return res.status(400).json({ error: err?.message || "No Orders found" });
  }
};
 
exports.createSignature = (message) => {
  const secret = "8gBm/:&EnhH.1/q"; //different in production
  // Create an HMAC-SHA256 hash
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);
 
  // Get the digest in base64 format
  const hashInBase64 = hmac.digest("base64");
  return hashInBase64;
}; 