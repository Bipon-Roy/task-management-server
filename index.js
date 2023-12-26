const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is Running");
});

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.sw3jgjt.mongodb.net/?retryWrites=true&w=majority`;
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
        // await client.connect();
        const tasksCollection = client.db("taskDb").collection("tasks");

        app.get("/tasks", async (req, res) => {
            const email = req.query.email;
            const filter = {};
            if (email) {
                filter.email = email;
            }
            const result = await tasksCollection.find(filter).toArray();
            res.send(result);
        });
        app.get("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await tasksCollection.find(query).toArray();
            res.send(result);
        });
        app.get("/todoList", async (req, res) => {
            const email = req.query.email;
            const filter = { status: "todo" };
            if (email) {
                filter.email = email;
            }

            const result = await tasksCollection.find(filter).toArray();
            res.send(result);
        });

        app.get("/ongoingList", async (req, res) => {
            const email = req.query.email;
            const filter = { status: "ongoing" };
            if (email) {
                filter.email = email;
            }

            const result = await tasksCollection.find(filter).toArray();
            res.send(result);
        });

        app.post("/tasks", async (req, res) => {
            const data = req.body;
            const result = await tasksCollection.insertOne(data);
            res.send(result);
        });

        app.patch("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const fetchTask = req.body;
            console.log(fetchTask);
            const updatedTask = {
                $set: {
                    title: fetchTask.title,
                    descriptions: fetchTask.descriptions,
                    priority: fetchTask.priority,
                    date: fetchTask.date,
                    status: fetchTask.status,
                },
            };

            const result = await tasksCollection.updateOne(filter, updatedTask, options);
            res.send(result);
        });
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
