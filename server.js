const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const UniitLeaderRoutes = require("./routes/unitLeaderRoutes")
const studentRoutes = require("./routes/studentRoutes");
const parentRoutes = require("./routes/parentRoutes");

// CORS config
const corsOptions = {
  origin: 'https://lihket.vercel.app',
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // for preflight


app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/unitLeaders', UniitLeaderRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);

app.listen(4000, '0.0.0.0', () => console.log("server is running on port 4000"));
