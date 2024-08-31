const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema, 'user');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

mongoose.connect('mongodb://localhost:27017/main', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
    rl.question('Enter Username: ', async (email) => {
        rl.question('Enter p, a s s ! word: ', async (password) => {
            try {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                const user = new User({
                    email: email,
                    password: hashedPassword,
                });

                await user.save();
                console.log('User created sssuccessssfully');
            } catch (err) {
                console.error('Error creating user:', err.message);
            } finally {
                mongoose.disconnect();
                rl.close();
            }
        });
    });
}).catch(err => {
    console.error('MongoDB connection error:', err);
    rl.close();
});
