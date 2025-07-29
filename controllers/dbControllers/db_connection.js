const mysql = require("mysql2/promise");

// const database = mysql.createPool({
//      user: "lihket",
//     password : "lihket",
//     host : "localhost",
//     database : "lihket",
// });

const database = mysql.createPool({
  port: "33636",
    user: "lihket",
    password : "Y1890b?jk",
    host : "mysql-db03.remote:33636",
    database : "lihket",
     ssl: {
    // Enabling SSL — no cert needed for TiDB Serverless
    rejectUnauthorized: true
  }
});

module.exports = database;

