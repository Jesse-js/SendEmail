require("dotenv").config();
const express = require("express");
const config = require("./config/smtp");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
const myOAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);
app.get("/", function (req, res) {
  res.send({
    message: "Default route in email tutorial project",
  });
});

myOAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});
const myAccessToken = myOAuth2Client.getAccessToken();

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.USER_EMAIL, 
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: myAccessToken, 
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.post("/sendemail", function (req, res) {
  const mailOptions = {
    from: process.env.USER_EMAIL, 
    to: req.body.email, 
    subject: "E-mail de teste", 
    html: "<p>E-mail enviado a partir do Nodemailer com Gmail</p>", 
  };
  transport.sendMail(mailOptions, function (err, result) {
    if (err) {
      console.log(err);
      res.send({
        message: err,
      });
    } else {
      transport.close();
      res.send({
        message: "Email has been sent: check your inbox!",
      });
    }
  });
});

app.listen(PORT, function (req, res) {
  console.log(`Listening on port ${PORT}`);
});
