const mysql = require("mysql");

// const database = mysql.createConnection({
//     user: "lihket",
//     password : "lihket",
//     host : "localhost",
//     database : "lihket",
// });

const database = mysql.createConnection({
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

database.connect((err)=> {
    if(err) console.log(err);
    else console.log("connected");
});

module.exports = database;

