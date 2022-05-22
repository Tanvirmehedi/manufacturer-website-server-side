const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

//MeddleWare ----------------------------------------------------------
app.use(cors());
app.use(express.json());
//MeddleWare-----------------------------------------------------------

//CONNECTION mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rlvoc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const servicesCollection = client
      .db("toolify_database")
      .collection("services");
    // --------------------------------------------------GET REQUEST SERVICES-----------
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    //-----------------------------------------------------------------------
  } finally {
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome Toolify  Website ");
});

app.listen(port, () => {
  console.log(`Toolify App listening on port ${port}`);
});
