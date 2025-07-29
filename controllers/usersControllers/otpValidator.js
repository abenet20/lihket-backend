const database = require("../dbControllers/db_connection");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const json = require("body-parser/lib/types/json");

const otpValidator = async (phone, otp) => {
  const [otps] = await database.query(
    `SELECT otp, expires_at FROM otps WHERE user_id = ? AND expires_at > NOW()`,
    [phone]
  );
  // console.log(otps);

  if (!otps.length) {
    return { success: false, message: "OTP expired or not found" };
  }

  const isMatch = await bcrypt.compare(otp.toString(), otps[0].otp);
  if (!isMatch) {
    return { success: false, message: "Invalid OTP" };
  }
  // Delete OTP after successful validation
  await database.query("DELETE FROM otps WHERE user_id = ?", [phone]);
  return { success: true, message: "otp matched" };
};

// ...existing code...
// otpValidator("0920864496", "531630").then(console.log);
// ...existing code...
module.exports = {otpValidator};
