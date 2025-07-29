const express = require("express");
const router = express.Router();

const send = (to, message) => {
  fetch(`https://api.afromessage.com/api/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZGVudGlmaWVyIjoiOENrcjY5NUl6QmRMb3lBcEx3Z3lCbTFIb2JYTkpzSjIiLCJleHAiOjE5MTEyOTE4NjksImlhdCI6MTc1MzUyNTQ2OSwianRpIjoiOThiZDU4NDgtMDgwMC00NjQ2LTk2ZGMtYTdiYTVjMzFlYmJiIn0.IDr6MhfLIU3VI3IQilUdM_PJtDvTG3uKYxXKHOPukc8`,
    },
    body: JSON.stringify({
      from: "e80ad9d8-adf3-463f-80f4-7c4b39f7f164",
      sender: "9786",
      to: to,
      message: message,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Message sent successfully:", data);
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};

// send("920864496", "Hello, this is a test message from Lihket!");

module.exports = {
  send,
};
