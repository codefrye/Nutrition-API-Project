const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// importing models
const userModel = require('./models/userModel')
const foodModel = require('./models/foodmodel')
const verifytoken = require('./models/verifyToken')
const trackingModel = require('./models/trackinModel')


const port = 3000;
const app = express()
app.listen(port, () => console.log(`Nutrition app listening on port ${port}!`))


mongoose.connect("mongodb://127.0.0.1:27017/nutrition-api")
    .then(() => {
        console.log("connected to the nutrition database");
    })
    .catch((err) => {
        console.log(err);
    })

app.use(express.json())  //to parse incoming requests with JSON payloads

app.post('/register', (req, res) => {
    let user = req.body;

    bcrypt.genSalt(10, (err, salt) => {
        if (!err) {
            bcrypt.hash(user.password, salt, async (err, hpass) => {
                if (!err) {
                    user.password = hpass;
                    try {
                        let doc = await userModel.create(user);
                        res.send({ message: "user registered" })
                    } catch (err) {
                        console.log(err);
                        res.status(500).send({ message: "some pronblem" })

                    }
                }
            })
        }

    })
})

app.post('/login', async (req, res) => {
    let userCred = req.body;
    try {
        const user = await userModel.findOne({ email: userCred.email })
        if (user !== null) {
            bcrypt.compare(userCred.password, user.password, (err, success) => {
                if (success) {
                    jwt.sign({ email: userCred.email }, 'nutritionapp', (err, token) => {
                        if (!err) { res.send({ token: token, userid: user._id, message: "login successfull" }); }
                    })

                } else {
                    res.send({ message: "password incorrect" })
                }
            })
        } else {
            res.status(404).send({ message: "usere not found" })
        }
    } catch (err) {
        console.log("error in login ", err);
        res.status(500).send({ message: "server error" })
    }
})
// endpoint to see all the foods

// using old method(.then .catch)
// app.get("/foods",(req,res)=>{
//    foodModel.find()
//    .then((foodData)=>{
//     res.json(foodData);
//    })
//    .catch((err)=>{
//     console.log(err);
//     res.send("some problem")
//    })
// })

// using try catch method or async await

app.get('/foods', verifytoken, async (req, res) => {
    try {
        let foods = await foodModel.find()
        res.send({ message: "endpoint works here is all the data in foods table", foodtable: foods })
    } catch (err) {
        console.log(err);
        res.send("some problem")
    }
})

// endpoint to search food by name
app.get("/foods/:name", verifytoken, async (req, res) => {
    try {
        const food = await foodModel.find({ name: { $regex: req.params.name, $options: 'i' } })

        if (food.length !== 0) { res.send(food) } else { res.status(404).send({ message: "No matching entries" }) }
    } catch (err) {
        console.log(err)
        res.send({ message: "food not found" })
    }
})

// tracking food by name endpoint
app.post("/track", verifytoken, async (req, res) => {
    try {
        let trackData = req.body;

        let data = await trackingModel.create(trackData)
        res.status(201).send({ message: 'food tracked' })
    } catch (err) {
        console.log("error in loging food ", err);
        res.status(500).send({ message: "server error some problem in getting food" })
    }
})

// endpoints to fetch all foods eaten by [a person
app.get('/track/:userid/:date', verifytoken, async (req, res) => { /* while parsing url in request pass date in format (MM-DD-YYYY)*/

    let userid = req.params.userid;
    let date = new Date(req.params.date);
    let strDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

    // YourModel.find({ $expr: { $eq: [ { $dateToString: { format: '%Y-%m-%d', date: '$dateField' } }, todayDateOnly // Date string without time ] }})
    try {

        let foods = await trackingModel.find({ userId: userid, eatenDate: strDate }).populate('userId').populate('foodId')

        res.send(foods)
    } catch (err) {
        console.log("error in loging food ", err);
        res.status(500).send({ message: "server error some problem in getting food" })

    }
})





