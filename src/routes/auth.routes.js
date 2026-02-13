const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const router = express.Router();

function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation (we'll upgrade later)
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash }
    });

    // Optional: return token immediately after register
    const token = signToken(user.id);

    return res.status(201).json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error." });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = signToken(user.id);

    return res.json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
