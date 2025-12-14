require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

//add need skill
app.post("/api/add-need", (req, res) => {
    const { user_id, skill_id } = req.body;

    const sql = "INSERT INTO user_skills_need (user_id, skill_id) VALUES (?, ?)";
    db.query(sql, [user_id, skill_id], (err, result) => {
        if (err) return res.status(500).send({ error: err });
        res.send({ message: "Need skill added successfully" });
    });
});

//add teach skill
app.post("/api/add-teach", (req, res) => {
    const { user_id, skill_id } = req.body;

    const sql = "INSERT INTO user_skills_teach (user_id, skill_id) VALUES (?, ?)";
    db.query(sql, [user_id, skill_id], (err, result) => {
        if (err) return res.status(500).send({ error: err });
        res.send({ message: "Teach skill added successfully" });
    });
});



app.use(express.static("Public"));


// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Test connection API
app.get("/", (req, res) => {
  res.send({ message: "Backend running successfully 🚀" });
});

// Get all users
app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server running on port", port);
});


// get all skills
app.get("/api/skills", (req, res) => {
  db.query("SELECT * FROM skills", (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

// discover skills what users need
app.get("/api/discover/need", (req, res) => {
  const sql = `
      SELECT u.username, s.skill_name
      FROM user_skills_need n
      JOIN users u ON n.user_id = u.user_id
      JOIN skills s ON n.skill_id = s.skill_id;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

//skills users can teach
app.get("/api/discover/teach", (req, res) => {
  const sql = `
      SELECT u.username, s.skill_name
      FROM user_skills_teach t
      JOIN users u ON t.user_id = u.user_id
      JOIN skills s ON t.skill_id = s.skill_id;
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

//matching logics
app.get("/api/match/can-teach/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
      SELECT u2.username AS teacher, s.skill_name
      FROM user_skills_need n
      JOIN skills s ON n.skill_id = s.skill_id
      JOIN user_skills_teach t ON n.skill_id = t.skill_id
      JOIN users u1 ON n.user_id = u1.user_id
      JOIN users u2 ON t.user_id = u2.user_id
      WHERE u1.user_id = ?;
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});

//mutual matching
app.get("/api/match/mutual", (req, res) => {
  const sql = `
    SELECT 
      u1.username AS userA,
      u2.username AS userB,
      s1.skill_name AS skill_needed_by_A_taught_by_B,
      s2.skill_name AS skill_needed_by_B_taught_by_A
    FROM user_skills_need n1
    JOIN user_skills_teach t1 ON n1.skill_id = t1.skill_id
    JOIN users u1 ON n1.user_id = u1.user_id
    JOIN users u2 ON t1.user_id = u2.user_id
    JOIN user_skills_need n2 ON t1.user_id = n2.user_id
    JOIN user_skills_teach t2 ON n2.skill_id = t2.skill_id
    JOIN skills s1 ON n1.skill_id = s1.skill_id
    JOIN skills s2 ON n2.skill_id = s2.skill_id
    WHERE t2.user_id = u1.user_id;
  `;
  
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
});
