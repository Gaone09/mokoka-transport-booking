const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING id,name,email",
      [name, email, hashed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: "User already exists" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
  if (!user.rows.length) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.rows[0].password);
  if (!match) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email } });
});

module.exports = router;
