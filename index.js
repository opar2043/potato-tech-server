require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5001;

// Stripe payment
const stripe = require("stripe")('sk_test_51QfDLMIXauIQhi9z2YKPjARUsDdX4HpGOsQ48gMIXOngdwchRhKZQPPrttr8yLRUPImn2fnZPOo6n9KpzcRuX91J00Os8ROo5u');

const app = express();
app.use(express.json());
app.use(cors());


const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Corrected MongoDB URI
const uri = `mongodb+srv://hotel-booking:oyIaWLR7jM3tZiQy@cluster0.xfvkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.xfvkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect(); // Connect to MongoDB

    const db = client.db("hotel-booking");
    const paymentCollection = db.collection("payments");
    const bookingsCollection = db.collection("bookings");
    const roomsCollection = db.collection("rooms");
    const usersCollection = db.collection("users");

    console.log("MongoDB connected successfully!");

    // Stripe payment endpoint
    app.post("/create-payment-intent", async (req, res) => {
      const { grandTotal } = req.body;
      const amount = parseFloat(grandTotal * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({ clientSecret: paymentIntent.client_secret });
    });

    // API Starts here
    app.post("/bookings", async (req, res) => {
      const bookings = req.body; // could be an array
      if (Array.isArray(bookings)) {
        await bookingsCollection.insertMany(bookings);
      } else {
        await bookingsCollection.insertOne(bookings);
      }
      res.send({ message: "Booking saved" });
    });

    app.get("/bookings", async (req, res) => {
      const result = await bookingsCollection.find().toArray();
      res.send(result);
    });

    // Rooms API's

    app.post("/rooms", async (req, res) => {
      const rooms = req.body;
      const result = await roomsCollection.insertOne(rooms);
      res.send(result);
    });

    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });

    app.patch("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body; // receive new status from frontend

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status: status },
      };

      const result = await roomsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //  API's Users

    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

app.patch("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body; // receive new role from frontend

    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { role: role }, // update role instead of status
    };

    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Failed to update user role" });
  }
});




  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

// API Route
app.get("/", (req, res) => {
  res.send("Hotel Booking num 2 API Running...");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
