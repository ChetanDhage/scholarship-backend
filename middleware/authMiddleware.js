import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Split the token from the Bearer string
      const authHeader = req.headers.authorization.split(" ");
      if (authHeader.length !== 2 || !authHeader[1]) {
        return res
          .status(401)
          .json({ message: "Malformed authorization header" });
      }

      token = authHeader[1];

      // Verify token existence before verification
      if (!token || token === "null" || token === "undefined") {
        return res
          .status(401)
          .json({ message: "Not authorized, invalid token" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user and attach to the request object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      const message =
        error.name === "JsonWebTokenError" && error.message === "jwt malformed"
          ? "Invalid token format"
          : "Not authorized, token failed";
      res.status(401).json({ message });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// RestrictTo middleware remains unchanged
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

// Role-specific middlewares remain unchanged
export const teacherOnly = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access required" });
  }
  next();
};

export const headquarterOnly = (req, res, next) => {
  if (req.user.role !== "headquarter") {
    return res.status(403).json({ message: "Headquarter access required" });
  }
  next();
};

export { protect, restrictTo };
