import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";

//register user

export const register = async (req, resp) => {
  // Check for missing details
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return resp
      .status(400)
      .json({ success: false, message: "Missing Details" });
  }
  try {
    // Check for an existing user
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      resp.status(400).json({ success: false, message: "User already exists" });
    }
    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const user = await new userModel({ name, email, password: hashPassword });
    // Generate token
    const token = await jwt.sign({ id: user._id }, "secret#text", {
      expiresIn: "7d",
    });
    // Set cookie with token
    resp.cookie("token", token, {
      httpOnly: true,
      secure: "development" === "production",
      sameSite: "development" === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Save user to database
    await user.save();
    resp
      .status(200)
      .json({ success: true, message: "User created successfully", user });
  } catch (error) {
    resp.status(500).json({ success: false, message: error.message });
  }
};

//login user

export const login = async (req, resp) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return resp
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return resp
        .status(400)
        .json({ success: false, message: "Invalid email" });
    }

    // Check if the password matches
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return resp
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, "secret#text", {
      expiresIn: "7d",
    });

    // Set cookie with token
    resp.cookie("token", token, {
      httpOnly: true,
      secure: "development" === "production",
      sameSite: "development" === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send success response
    return resp
      .status(200)
      .json({ success: true, message: "Login successful" });
  } catch (error) {
    // Handle unexpected errors
    return resp.status(500).json({ success: false, message: error.message });
  }
};

//logout user

export const logout = async (req, resp) => {
  try {
    resp.clearCookie("token", {
      httpOnly: true,
      secure: "development" === "production",
      sameSite: "development" === "production" ? "none" : "strict",
    });
    return resp.status(201).json({ success: true, message: "Logged out" });
  } catch (error) {
    resp.status(500).json({ success: false, message: error.message });
  }
};
