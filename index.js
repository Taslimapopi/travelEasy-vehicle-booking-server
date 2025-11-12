const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const admin = require("firebase-admin");
const port = process.env.PORT || 3000;

// index.js
const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_KEY,
  "base64"
).toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// middleware
app.use(cors());
app.use(express.json());

const verifyFirebaseToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  //
  try {
    const userInfo = await admin.auth().verifyIdToken(token);
    req.token_email = userInfo.email;
    // console.log("after firebase validation", userInfo);
    next();
  } catch {
    return res.status(401).send({ message: "unauthorized access" });
  }
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rgrxfrw.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("TravelEase is running");
});


    // await client.connect();
    const db = client.db("TravelEase");
    const vehicleCollections = db.collection("vehicles");
    const bookingsCollections = db.collection("bookings");

    app.get("/vehicles", async (req, res) => {
      const result = await vehicleCollections
        .find()
        .sort({ createdAt: 1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // app.get("/all-vehicles", async (req, res) => {
    //   const result = await vehicleCollections.find().toArray();
    //   res.send(result);
    // });

    app.get("/all-vehicles", async (req, res) => {
      try {
        const sortOrder = req.query.sort;
        let sortOption = {};
        if (sortOrder === "asc") {
          sortOption = { pricePerDay: 1 };
        } else if (sortOrder === "dsc") {
          sortOption = { pricePerDay: -1 };
        }

        const vehicles = await vehicleCollections
          .find()
          .sort(sortOption)
          .toArray();
        res.send(vehicles);
      } catch (error) {
        res.status(500).send({ message: "Server error", error });
      }
    });

    app.get("/vehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await vehicleCollections.findOne(query);
      res.send(result);
    });

    app.post("/vehicles", async (req, res) => {
      const newVehicles = req.body;
      const result = await vehicleCollections.insertOne(newVehicles);
      res.send(result);
    });

    app.delete("/vehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await vehicleCollections.deleteOne(query);
      res.send(result);
    });

    app.put("/vehicles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const data = req.body;
      const updateData = {
        $set: data,
      };
      const result = await vehicleCollections.updateOne(query, updateData);
      res.send(result);
    });

    app.get("/my-vehicles", verifyFirebaseToken, async (req, res) => {
      const query = {};
      const email = req.query.email;

      if (email) {
        if (email !== req.token_email) {
          return res.status(403).send({ message: "forbidden" });
        }
        query.userEmail = email;
      }
      const result = await vehicleCollections.find(query).toArray();
      res.send(result);
    });

    // bookings

    app.get("/bookings", async (req, res) => {
      const result = await bookingsCollections.find().toArray();
      res.send(result);
    });

    app.get("/my-bookings", verifyFirebaseToken, async (req, res) => {
      const query = {};
      const email = req.query.email;

      if (email) {
        if (email !== req.token_email) {
          return res.status(403).send({ message: "forbidden" });
        }
        query.email = email;
      }
      const result = await bookingsCollections.find(query).toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const newBookings = req.body;
      const result = await bookingsCollections.insertOne(newBookings);
      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollections.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
