const mongoose = require('mongoose');

const mongoDB = process.env.MONGODB_URI || process.env.MONGODB_DEV;


mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));