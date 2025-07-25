require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5001;

const app = express();
app.use(express.json()); // Parse JSON requests
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://potato-tech-server.vercel.app/"],
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: "*",
  })
);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri =
//   "mongodb+srv://task-manager:8xV6VIRQIxbvQslA@cluster0.xfvkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri =
  "mongodb+srv://potatoTech:CbGpBaja49fj3lC6@cluster0.xfvkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const db = client.db("potatoTech");
    const productCollection = db.collection("products");
    const reviewCollection = db.collection("reviews");
    const userCollection = db.collection("users");
    const orderCollection = db.collection("orders");
    const addtocartCollection = db.collection("addtocart");

    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await productCollection.insertOne(products);
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    // Products =======================================================

    // app.get("/products", async (req, res) => {
    //   try {
    //     const mouse = req.query.mouse;
    //     let query = {};

    //     if (mouse) {
    //       query.mouse = mouse;
    //     }

    //     const result = await productCollection.find(query).toArray();
    //     res.send(result);
    //   } catch (err) {
    //     console.error("Error fetching products:", err.message);
    //     res.status(500).send("Internal Server Error");
    //   }
    // });

    app.get("/products", async (req, res) => {
      const category = req.query.category;
      let query = {};

      if (category) {
        query.category = category;
      }

      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = req.body;
      const products = {
        $set: {
          name: update.name,
          category: update.category,
          description: update.description,
          sortdes: update.sortdes,
          prePrice: update.prePrice,
          price: update.price,
          stock: update.stock,
          sub: update.sub || "",
          images: update.images || [],
          features: update.features || [],
        },
      };

      const result = await productCollection.updateOne(filter, products);
      res.send(result);
    });

    // Users ====================================================

    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await userCollection.insertOne(users);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          role: "admin",
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          role: "customer",
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    // Orders  ==============================================

    app.post("/orders", async (req, res) => {
      const orders = req.body;
      const result = await orderCollection.insertOne(orders);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find().toArray();
      res.send(result);
    });

    // Add To Cart ==============================================

    app.post("/add-to-cart", async (req, res) => {
      const addcart = req.body;
      const result = await addtocartCollection.insertOne(addcart);
      res.send(result);
    });

    app.get("/add-to-cart", async (req, res) => {
      const result = await addtocartCollection.find().toArray();
      res.send(result);
    });

    app.delete("/add-to-cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addtocartCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// API Routes
app.get("/", (req, res) => {
  res.send("Potato Tech server Running");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
