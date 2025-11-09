const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rgrxfrw.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("smart deal is running");
});

async function run() {
  try {
    
    await client.connect();
    const db = client.db("TravelEase");
    const vehicleCollections = db.collection("vehicles");

    app.get('/vehicles',async(req,res)=>{
        const result =await vehicleCollections.find().toArray()
        res.send(result)
    })

    app.get('/vehicles/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await vehicleCollections.findOne(query)
        res.send(result)
    })

    app.post('/vehicles',async(req,res)=>{
        const newVehicles = req.body
        const result =await vehicleCollections.insertOne(newVehicles)
        res.send(result)
    })

    app.delete('/vehicles/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await vehicleCollections.deleteOne(query)
        res.send(result)
    })

    app.put('/vehicles/:id',async(req,res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const data = req.body
        const updateData = {
            $set: data
        }
        const result = await vehicleCollections.updateOne(query,updateData)
        res.send(result)
    })




    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});