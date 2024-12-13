import express from "express";
import mongoose from "mongoose";
import router from "./routes/authRoute.js";

const app = express();

const PORT = 3001;
app.use(express.json());

app.use("/api/auth/", router);

// connecting the database

mongoose
  .connect("mongodb://127.0.0.1:27017/Auth")
  .then(() => {
    console.log("Coonecting the database");
  })
  .catch((error) => {
    console.log("Failed to connect toDb");
  });

app.listen(PORT, () => {
  console.log("Listing the port", PORT);
});
