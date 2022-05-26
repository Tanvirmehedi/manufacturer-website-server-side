const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ObjectID,
} = require("mongodb");
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

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "UnAuthorize Access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
};

const run = async () => {
  try {
    await client.connect();
    // COLLECTION INITIALIZATION
    const servicesCollection = client
      .db("toolify_database")
      .collection("services");
    const productCollection = client
      .db("toolify_database")
      .collection("products");
    const userCollection = client.db("toolify_database").collection("users");
    const purchaseCollection = client
      .db("toolify_database")
      .collection("purchase");
    // COLLECTION INITIALIZATION

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

    // --------------------------------------------
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = productCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
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

    app.get("/allusers", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, {
        expiresIn: "10h",
      });
      res.send({ result, token });
    });
    //--------------------------------User Request ---------------------------------------

    //--------------------------------Purchase Request ---------------------------------------

    app.get("/purchase", verifyJWT, async (req, res) => {
      const email = req.query.userEmail;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const query = { userEmail: email };
        const purchase = await purchaseCollection.find(query).toArray();
        return res.send(purchase);
      } else {
        return res.status(403).send({ message: "forbidden access" });
      }
    });

    // ------------------------------------------------------------
    app.post("/purchase", async (req, res) => {
      const purchase = req.body;
      const result = await purchaseCollection.insertOne(purchase);
      res.send(result);
    });
    //--------------------------------Purchase Request ---------------------------------------
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
