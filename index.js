const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = `mongodb+srv://dummy_storage:93K7vpjWY0aPkBh0@cluster0.yai2s.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

// Run server and database connection
async function run() {
  try {
    await client.connect();
    // const database = await connectToDatabase();
    const database = client.db("ChatStoreage");
    console.log("Database connected");
    const messagesCollection = database.collection("messages");
    // API Routes

    // Get all messages
    app.get("/allMessages", async (req, res) => {
      try {
        const messages = await messagesCollection.find({}).toArray();
        res.status(200).send(messages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        res.status(500).send({ error: "Failed to fetch messages" });
      }
    });

    app.get("/messages/user/:userid", async (req, res) => {
      try {
        const { userid } = req.params;

        // Query to find messages by userid
        const messages = await messagesCollection.find({ userid }).toArray();
        res.status(200).send(messages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        res.status(500).send({ error: "Failed to fetch messages" });
      }
    });

    app.post("/save-message", async (req, res) => {
      try {
        const messageData = req.body;
        // Validate if messageData exists
        if (!messageData || !messageData.content) {
          return res.status(400).send({ error: "Message content is required" });
        }

        const result = await messagesCollection.insertOne(messageData);

        // If message is successfully inserted
        if (result.acknowledged) {
          res.status(200).send({
            message: "Message saved successfully",
            id: result.insertedId,
          });
        } else {
          res.status(500).send({ error: "Failed to save message" });
        }
      } catch (error) {
        console.error("Failed to save message:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

// Default route
app.get("/", (req, res) => {
  res.send("Dummy Storage Server Running...");
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

module.exports = app;
