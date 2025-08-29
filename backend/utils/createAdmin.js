const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";

const createAdminIfNotExists = async () => {
  try {
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const adminUser = new User({
        name: "Admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        verificationMethod: "manual_review",
        badge: "premium",
      });
      await adminUser.save();
      console.log("Predefined admin created:", ADMIN_EMAIL);
    } else {
      console.log("Admin already exists");
    }
  } catch (err) {
    console.error("Error creating admin:", err);
  }
};

module.exports = createAdminIfNotExists;
