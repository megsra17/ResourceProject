// src/routes/users.js
import express from 'express'
import User from '../models/Users.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

dotenv.config()

const router = express.Router()

// Create a transporter using your email service credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
  port: process.env.SMTP_PORT, // e.g., 587
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your email address
    pass: process.env.SMTP_PASS, // your email password or app password
  },
})

// Registration endpoint
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body
  try {
    // Check if the user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Create a new user
    user = new User({ email, password, name, role })
    await user.save()

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    })

    res.json({ user, token })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
    res.json({ user, token })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Request password reset
router.post('/reset-password-request', async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'No user with that email' })
    }
    // Generate reset token
    const resetToken = user.generatePasswordReset()
    await user.save()
    // Point to your frontend domain instead of the backend host
    const resetUrl = `http://localhost:5173/reset-password?key=${resetToken}`

    // Set up email options
    const mailOptions = {
      from: '"Your App Name" <no-reply@yourapp.com>',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click here to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>If you did not request this, please ignore this email.</p>`,
    }

    // Send email
    await transporter.sendMail(mailOptions)
    res.json({ message: 'Reset link sent', resetUrl })
  } catch (error) {
    console.error('Reset password request error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body
  try {
    // Hash the token provided to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }
    // Set the new password
    user.password = newPassword
    // Clear reset fields
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    res.json({ message: 'Password has been reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
