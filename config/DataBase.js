const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('🥰 Server Connected to DataBase Sucessfully');
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err);
    }
};

module.exports = connectDB;
