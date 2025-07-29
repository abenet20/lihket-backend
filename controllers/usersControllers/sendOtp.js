const database = require("../dbControllers/db_connection");
const bcrypt = require("bcrypt");
const { send } = require("../senders/smsSender");

const sendOtp = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit code
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

  const encryptedOtp = await bcrypt.hash(otp.toString(), 10);

  const [deleteExistingOtps] = await database.query(
    `DELETE FROM otps WHERE user_id = ?`,
    [phone]
  );

  await database.query(
    "INSERT INTO otps (user_id, otp, expires_at) VALUES (?, ?, ?)",
    [phone, encryptedOtp, expiresAt]
  );

  send(phone, `Your OTP is ${otp}. It is valid for 5 minutes.`);
};

// sendOtp("0920864496");
module.exports = { sendOtp };
