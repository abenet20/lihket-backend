const mysql = require("mysql2/promise");

// const database = mysql.createPool({
//      user: "lihket",
//     password : "lihket",
//     host : "localhost",
//     database : "lihket",
// });

const database = mysql.createPool({
  port: "4000",
    user: "2D3iQN52LRKfD8s.root",
    password : "Wx5TlKNi5NAx50h4",
    host : "gateway01.us-west-2.prod.aws.tidbcloud.com",
    database : "lihket",
  ssl: {
  rejectUnauthorized: true,
  }
});

module.exports = database;

