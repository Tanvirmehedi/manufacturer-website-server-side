const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const productCollection = client
      .db("toolify_database")
      .collection("products");
    const userCollection = client.db("toolify_database").collection("users");
    // --------------------------------------------------GET REQUEST SERVICES-----------
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    // --------------------------------------------------GET REQUEST SERVICES-----------

    //--------------------------------Product Request ---------------------------------------
    app.get("/products", async (req, res) => {
      const query = {};
      const sort = { _id: -1 };
      const cursor = productCollection.find(query).limit(6).sort(sort);
      const products = await cursor.toArray();
      res.send(products);
    });

    // POST Request
    app.post("/product", async (req, res) => {
      const product = req.body;
      const query = { name: product.name };
      const exists = await productCollection.findOne(query);
      if (!product.name || exists) {
        return res.send({ success: false, product: exists });
      }
      const result = await productCollection.insertOne(product);
      res.send({ success: true, result });
    });
    //--------------------------------Product Request ---------------------------------------
    //--------------------------------User Request ---------------------------------------
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    //--------------------------------User Request ---------------------------------------
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
