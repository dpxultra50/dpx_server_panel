const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
var cors = require("cors");
const errorMiddleware = require("./middleware/error");

// Config
dotenv.config({ path: "./config/config.env" });

// Middleware
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  })
);

app.use(express.static(`${__dirname}/public`));

//JSON REQUEST HANDELER Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Route Imports
const user = require("./routes/userRoute");
const userMeeting = require("./routes/userMeetingRoute");
const newsLetter = require("./routes/newsLetterRouts");
const project = require("./routes/projectRoute");

app.use("/api/v1/", user);
app.use("/api/v1/", userMeeting);
app.use("/api/v1/", newsLetter);
app.use("/api/v1/", project);

app.use(errorMiddleware);
module.exports = app;
