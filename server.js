const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/school")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// Test route
app.get("/", (req, res) => {
    res.send("API is running");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});



