// server.js
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT, () =>
    console.log("Server running")
  );
});
