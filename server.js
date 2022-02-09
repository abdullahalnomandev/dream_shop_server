const express = require("express");
const router = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
router.use(cors());
router.use(express.json());
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ez7qy.mongodb.net/eDreamShop?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("eCommerceDramShop");
    const foodCollection = database.collection("foods");
    const vegetableCollection = database.collection("vegetable");
    const bookingCollection = database.collection("bookings");

    // BOOOKING

    //ADD Booking

    router.post('/addBooking',async(req,res)=>{
      const booking= req.body
      console.log(booking);
      const result = await bookingCollection.insertOne(booking)
      res.json(result)

    })

    router.get('/allOrder',async(req,res)=>{
        const order = bookingCollection.find({})
        const orders = await order.toArray();
        res.json(orders)
    })

    router.get('/ownOrder',(req,res)=>{
      const ownOrder = req.query.email
      console.log(ownOrder);
    })
    
    router.delete('/booking/:id',async(req,res)=>{
      const booking = req.params.id;
      console.log(booking);
      const result = await bookingCollection.deleteOne({_id:ObjectId(booking)})
      res.send(result)

    })
    

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
      const result = await foodCollection.deleteOne({_id:ObjectId(deletedItem)})
      if (result.deletedCount > 0) {
        console.log(result.deletedCount);
        res.send(result)
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
      res.json(freshVegetables);
    });

    // DELETE Vegetable
    router.delete("/fresh_vegetables/:id", async (req, res) => {
      const deletedItem = req.params.id;
      console.log(deletedItem);
      const result = await vegetableCollection.deleteOne({_id:ObjectId(deletedItem)})
      if (result.deletedCount > 0) {
        console.log(result.deletedCount);
        res.send(result)
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
