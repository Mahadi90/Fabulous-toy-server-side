const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wpfolqw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const galleryCollection = client.db('carsToyDB').collection('gallery');
    const categoryCollection = client.db('carsToyDB').collection('category');
    const carsCollecttion = client.db('carsToyDB').collection('cars')


    const indexKeys = { toyName : 1}
    const indexOptions = { name : 'ToyName' }

    const result = await carsCollecttion.createIndex(indexKeys, indexOptions)

    app.get('/toySearchByName/:text', async(req, res) => {
      const searchText = req.params.text;

      const result =await carsCollecttion.find({toyName : {$regex : searchText, $options : "i"}}).toArray()
      res.send(result)
    })

    app.get('/gallery', async(req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result)
    })

    app.get('/category', async(req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result)
    })

    // cars

    app.get('/allToys', async(req, res) => {
      const result = await carsCollecttion.find().toArray();
      res.send(result)
    })

    app.get('/allToys/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id : new ObjectId(id)}
      const resul = await carsCollecttion.findOne(query)
      res.send(resul)
    })

    app.get('/myToys/:email', async(req, res)=>{
      const email = req.params.email;
      // console.log(email)
      const result = await carsCollecttion.find({email : email}).toArray();
      res.send(result)
    })
    

    app.post('/cars', async(req, res) => {
      const body = req.body;
      // console.log(body)
      const result = await carsCollecttion.insertOne(body);
      res.send(result)
    })

    app.put('/allToys/:id', async(req, res)=> {
      const id = req.params.id;
      const toy = req.body;
      // console.log(id, toy)
      const filter = { _id : new ObjectId(id)}
      const options = {upsert : true};
      const updatedToys = {
        $set : {
          price : toy.price,
          quantity : toy.quantity,
          detail : toy.detail
        }
      }
      const resul = await carsCollecttion.updateOne(filter, updatedToys, options);
      res.send(resul)
    })

    app.delete('/allToys/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id)}
      const result = await carsCollecttion.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Fabulous toys server side is running...')
})

app.listen(port, () => {
    console.log(`Fabulous toys is running on port${port}`)
})