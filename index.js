const express = require('express')
const app = express();
require('dotenv').config()
const path = require('path')
const session = require('express-session');
const cookie = require('cookie-parser');
const flash = require('connect-flash');
const axios = require("axios");
const cron = require("node-cron");

let PORT = process.env.PORT || 5050

const authRoutes = require('./routes/authRoutes')
const indexRoutes = require('./routes/indexRoutes')
const adminRoutes = require('./routes/adminRoutes')
const isAuthenticated = require('./middleware/isAuthenticated')
const { ensureAuthenticated, ensureAdmin } = require('./middleware/isAdmin')
const db = require('./config/DataBase')
db()

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(cookie());
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const MongoStore = require("connect-mongo");

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions"
    }),
    cookie: {
        maxAge: 15 * 24 * 60 * 60 * 1000
    }
}));

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1); 
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    process.exit(1);
});

cron.schedule("*/14 * * * *", async () => {
    try {
        await axios.get("https://auraquiz-3d4i.onrender.com/");
        console.log("Keeping server alive");
    } catch (error) {
        console.error("Error keeping server alive:", error.message);
    }
});

app.use('/auth', authRoutes)
app.use('/', isAuthenticated, indexRoutes)
app.use('/admin', isAuthenticated, ensureAuthenticated, ensureAdmin, adminRoutes)

app.use((req, res) => {
    res.status(404).render("404error", { url: req.originalUrl });
});

app.use((err, req, res, next) => {
    console.error("Unexpected Error:", err);
    res.status(500).json({ message: "Server error, please try again later" });
});

app.listen(PORT, () => {
    console.log(`Server listen on ${PORT}`);
})