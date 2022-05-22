const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//MeddleWare ----------------------------------------------------------
app.use(cors());
app.use(express.json());
//MeddleWare-----------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Welcome Toolefy  Website ");
});

app.listen(port, () => {
  console.log(`Toolefy App listening on port ${port}`);
});
