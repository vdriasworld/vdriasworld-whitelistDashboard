import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const app = express();
const port = 19198;

const uri = 'mongodb://localhost:27017';

const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

app.get('/lists', async (req, res) => {
    try {
        const database = client.db('main');
        const collection = database.collection('list');

        const items = await collection.find().toArray();
        res.json(items);
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).send(err);
    }
});

app.put('/lists/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    const { status } = req.body;

    try {
        const database = client.db('main');
        const collection = database.collection('list');

        // Debug logs
        console.log('Connected to database:', database.databaseName);
        console.log('Collection name:', collection.collectionName);
        console.log('Updating item with UUID:', uuid);
        console.log('New status:', status);

        const query = { name: "sb" };
        const test = await collection.findOne({});
        console.log(test);

        const updateResult = await collection.updateOne(
            { uuid: uuid },
            { $set: { status: status } }
        );

        console.log('Update result:', updateResult);

        if (updateResult.matchedCount === 0) {
            return res.status(404).send('Item not found');
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(304).send('Status not modified');
        }

        const updatedItem = await collection.findOne({ uuid: uuid });
        res.json(updatedItem);
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).send(err);
    }
});

app.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server running at http://localhost:${port}`);
});
