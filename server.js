const express = require("express");
const router = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const admin = require("firebase-admin");
router.use(cors());
router.use(express.json());
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ez7qy.mongodb.net/eDreamShop?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
// deram-shop-firebase.json

const serviceAccount = require("./deram-shop-firebase.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyIdToken = async (req, res, next) => {
  if (req.headers.authorization.startsWith("Bearer ")) {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const decodeUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodeUser.email;
    } catch {}
  }
  next();
};

async function run() {
  try {
    await client.connect();
    const database = client.db("eCommerceDramShop");
    const foodCollection = database.collection("foods");
    const vegetableCollection = database.collection("vegetable");
    const bookingCollection = database.collection("bookings");
    const usersCollection = database.collection("users");

    // BOOOKING

    //ADD Booking

    router.post("/addBooking", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.json(result);
    });

    router.get("/allOrder", async (req, res) => {
      const order = bookingCollection.find({});
      const orders = await order.toArray();
      res.json(orders);
    });

    router.get("/ownOrder", verifyIdToken, async (req, res) => {
      const ownerEmail = req.query.email;
      const booking = bookingCollection.find({ email: ownerEmail });
      const allBooking = await booking.toArray();
      res.send(allBooking);
    });

    router.delete("/booking/:id", async (req, res) => {
      const booking = req.params.id;
      const result = await bookingCollection.deleteOne({
        _id: ObjectId(booking),
      });
      res.send(result);
    });

    // FRESH FOOD

    // POST Fresh Food API
    router.post("/fresh_foods", async (req, res) => {
      const food = req.body;
      console.log(food);
      const result = await foodCollection.insertOne(food);
      res.json(result);
    });

    //GET Fresh Food
    router.get("/allFresh_foods", async (req, res) => {
      const freshFood = foodCollection.find({});
      const freshFoods = await freshFood.toArray();
      res.json(freshFoods);
    });

    router.delete("/fresh_foods/:id", async (req, res) => {
      const deletedItem = req.params.id;
      console.log(deletedItem);
      const result = await foodCollection.deleteOne({
        _id: ObjectId(deletedItem),
      });
      if (result.deletedCount > 0) {
        console.log(result.deletedCount);
        res.send(result);
      }
    });

    // FRESH VEGETABLE

    // POST Fresh vegetable API
    router.post("/fresh_vegetables", async (req, res) => {
      const vegetable = req.body;
      console.log(vegetable);
      const result = await vegetableCollection.insertOne(vegetable);
      if (result.deletedCount > 0) {
        res.json(result);
      }
    });

    //GET VEGETABLE Food
    router.get("/allFresh_vegetables", async (req, res) => {
      const vegetables = vegetableCollection.find({});
      const freshVegetables = await vegetables.toArray();
      res.send(freshVegetables);
    });

    // DELETE Vegetable
    router.delete("/fresh_vegetables/:id", async (req, res) => {
      const deletedItem = req.params.id;
      console.log(deletedItem);
      const result = await vegetableCollection.deleteOne({
        _id: ObjectId(deletedItem),
      });
      if (result.deletedCount > 0) {
        console.log(result.deletedCount);
        res.send(result);
      }
    });

    //USER
    router.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role == "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
      console.log(email);
      console.log("admin", isAdmin);
    });

    router.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // USER PUT
    router.put("/updateUser", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const option = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    //getUser
    router.get("/allUsers", verifyIdToken, async (req, res) => {
      const requestEmail = req.decodedEmail;
      console.log('eemm',requestEmail);
      const user = await usersCollection.findOne({ email: requestEmail });
      if (user.role === "admin") {
        const allUsers = await usersCollection.find({})
        const allUser = await allUsers.toArray();
        res.send(allUser);
      } else {
        res.status(404).json({ message: "You are not admin" });
      }
    });

    // ADD ADMIN Role
    router.put("/user/admin", verifyIdToken, async (req, res) => {
      const user = req.body;
      const admin = user.admin;
      const requester = req.decodedEmail;
      if (requester) {
        const requestAccount = await usersCollection.findOne({
          email: requester,
        });
        if (requestAccount.role === "admin") {
          const filter = { email: admin };
          console.log(filter);
          const updateDoc = { $set: { role: "admin" } };
          const result = await usersCollection.updateOne({ filter }, updateDoc);
          res.send(result);
        }
      } else {
        res.status(403).json({ message: "Do do not have access to add admin" });
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

router.get("/", (req, res) => {
  res.send("Hello World! d");
});

router.listen(port, () => {
  console.log(`Example router listening on port ${port}`);
});
