const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 19198;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/main', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);

const itemSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    time: String,
    status: String
});

const Item = mongoose.model('main', itemSchema, 'list');

app.get('/lists', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/lists/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    const { status } = req.body;

    //dev log
    console.log('Database name:', mongoose.connection.name);
    console.log('Collection name:', Item.collection.name);
    console.log('Updating item with UUID:', uuid);
    console.log('New status:', status);
    console.log('Status type:', typeof status);
    console.log('Connected to database:', mongoose.connection.db.databaseName);
    console.log('Query condition:', { uuid: uuid });
    console.log('Update data:', { $set: { status: status } });

    const item = await Item.find();
    console.log(item);

    try {
        const updateResult = await Item.updateOne(
            { uuid: uuid },
            { $set: { status: status } },
            { writeConcern: { w: 1 } }
        );

        console.log('Update result:', updateResult);

        if (updateResult.matchedCount === 0) {
            return res.status(404).send('Item not found');
        }

        if (updateResult.modifiedCount === 0) {
            return res.status(304).send('Status not modified');
        }

        const updatedItem = await Item.findOne({ uuid: uuid });
        res.json(updatedItem);
    } catch (err) {
        console.error('Error during update:', err);
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
