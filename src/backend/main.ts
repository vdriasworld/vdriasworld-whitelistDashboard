const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

async function clearTokens() {
    try {
        const database = client.db('main');
        const tokenCollection = database.collection('token');
        await tokenCollection.deleteMany({});
        console.log('Cleared all tokens in collection');
    } catch (err) {
        console.error('Error clearing tokens:', err);
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
    const tokenFromClient = req.headers.authorization;

    try {
        const database = client.db('main');
        const tokenCollection = database.collection('token');
        const tokenRecord = await tokenCollection.findOne({ token: tokenFromClient });

        if (!tokenRecord) {
            return res.status(403).send('Unauthorized: Invalid token');
        }

        const listCollection = database.collection('list');
        const updateResult = await listCollection.updateOne(
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

        const updatedItem = await listCollection.findOne({ uuid: uuid });
        res.json(updatedItem);
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).send(err);
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const database = client.db('main');
        const usersCollection = database.collection('user');

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });

        const tokenCollection = database.collection('token');
        await tokenCollection.insertOne({ token, userId: user._id, createdAt: new Date() });

        return res.json({ token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, async () => {
    await connectToDatabase();
    await clearTokens();
    console.log(`Server running at http://localhost:${port}`);
});
