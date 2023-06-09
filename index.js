const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qkmfuva.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect();

    const categoryCollection = client.db("ToyBattleZone").collection("categories");

    // Create Category
    // app.post("/category", async (req, res) => {
    //   const category = req.body;
    //   console.log(category);
    //   const result = await categoryCollection.insertOne(category);
    //   res.send(result);
    // });

    const toyCollection = client.db("ToyBattleZone").collection("toys");
    // Create Toy
    app.post("/toy", async (req, res) => {
      const toy = req.body;
      //   console.log(toy);
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    });

    // Get Toys
    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find({}).limit(20).toArray();
      res.send(result);
    });

    // Search Toys
    app.get("/toys/search/:keyword", async (req, res) => {
      const { keyword } = req.params;

      const filter = {};
      if (keyword) {
        filter.$or = [
          { toyName: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ];
      }

      try {
        const result = await toyCollection.find(filter).limit(20).toArray();
        res.json(result);
      } catch (error) {
        console.error("Error searching for toys:", error);
        res.status(500).json({ error: "An error occurred while searching for toys." });
      }
    });

    // Get Toy By ID
    app.get("/toys/:id", async (req, res) => {
      const { id } = req.params;

      const result = await toyCollection.findOne({ _id: new ObjectId(id) });

      if (result) {
        res.send(result);
      } else {
        res.status(404).send("Toy not found");
      }
    });

    // Get Toys By Seller
    app.get("/toysBySeller/:email", async (req, res) => {
      const { email } = req.params;

      const result = await toyCollection.find({ sellerEmail: email }).toArray();

      if (result) {
        res.send(result);
      } else {
        res.status(404).send("Toy not found");
      }
    });

    // Update Toy
    app.put("/toysBySeller/:email/:id", async (req, res) => {
      const { email, id } = req.params;
      const toy = req.body;

      const result = await toyCollection.updateOne(
        {
          sellerEmail: email,
          _id: new ObjectId(id),
        },
        {
          $set: {
            ...toy,
          },
        }
      );

      res.send(result);
    });

    // Delete Toy
    app.delete("/toysBySeller/:email/:id", async (req, res) => {
      const { email, id } = req.params;

      const result = await toyCollection.deleteOne({
        sellerEmail: email,
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ToyBattleZone server is running.");
});

app.listen(port, () => {
  console.log(`ToyBattleZone server is running on port: ${port}`);
});
