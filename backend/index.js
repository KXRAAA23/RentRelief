require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const mime = require('mime-types');

const listingRoutes = require("./routes/listings");
const authRoutes = require("./routes/auth");
const { fileURLToPath } = require("url");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
}));
app.use("/api/listings", listingRoutes);
app.use("/api/auth", authRoutes);

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGODB_URI is not defined in your .env file.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
