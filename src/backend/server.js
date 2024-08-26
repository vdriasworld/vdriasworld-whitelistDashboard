const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 19198;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/whitelist', { useNewUrlParser: true, useUnifiedTopology: true });

const authorSchema = new mongoose.Schema({
    uuid: String,
    name: String,
    time: String,
    status: String
});

const Item = mongoose.model('item', authorSchema, 'list');

app.get('/lists', async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/lists/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    const { status } = req.body;
    try {
        const updatedItem = await Item.findOneAndUpdate(
            { uuid: uuid },
            { $set: { status: status } },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).send('Item not found');
        }
        res.json(updatedItem);
    } catch (err) {
        res.status(500).send(err);
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
