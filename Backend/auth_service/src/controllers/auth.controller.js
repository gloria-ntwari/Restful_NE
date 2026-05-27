const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

// Register a new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, otp_code, otp_expires_at, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, first_name, last_name, email, role, created_at`,
      [firstName, lastName, email, hashedPassword, role || 'parking_attendant', otpCode, otpExpiresAt, false]
    );

    const user = result.rows[0];

    // Send OTP via email
    try {
      const { sendOtpEmail } = require('../utils/mailer');
      await sendOtpEmail(email, firstName, otpCode);
    } catch (mailErr) {
      console.error('Failed to send OTP email during registration:', mailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! An OTP verification code has been sent to your email. Please verify to activate your account.',
      data: {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if account is verified
    if (!user.is_verified) {
      // Generate new OTP and update user
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await pool.query(
        'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
        [otpCode, otpExpiresAt, user.id]
      );

      // Send the email
      try {
        const { sendOtpEmail } = require('../utils/mailer');
        await sendOtpEmail(user.email, user.first_name, otpCode);
      } catch (mailErr) {
        console.error('Failed to send OTP email during unverified login attempt:', mailErr);
      }

      return res.status(403).json({
        success: false,
        isVerified: false,
        email: user.email,
        message: 'Your account is not verified. A new verification OTP code has been sent to your email.',
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((u) => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        role: u.role,
        createdAt: u.created_at,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

const formatUser = (u) => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  email: u.email,
  role: u.role,
  createdAt: u.created_at,
});

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, password } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists.',
        });
      }
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(lastName);
    }
    if (email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (role !== undefined) {
      fields.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      fields.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.',
      });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, first_name, last_name, email, role, created_at`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: formatUser(result.rows[0]),
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required.',
      });
    }

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified.',
      });
    }

    // Check if OTP matches
    if (user.otp_code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.',
      });
    }

    // Check if OTP is expired
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Update user to verified
    await pool.query(
      'UPDATE users SET is_verified = true, otp_code = null, otp_expires_at = null WHERE id = $1',
      [user.id]
    );

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Account verified and activated successfully!',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified.',
      });
    }

    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Update database
    await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
      [otpCode, otpExpiresAt, user.id]
    );

    // Send email
    try {
      const { sendOtpEmail } = require('../utils/mailer');
      await sendOtpEmail(email, user.first_name, otpCode);
    } catch (mailErr) {
      console.error('Failed to send OTP email during resend:', mailErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'A new OTP code has been sent to your email.',
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = { register, login, getProfile, getAllUsers, updateUser, deleteUser, verifyOtp, resendOtp };

