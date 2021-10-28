const express = require("express");
const app= express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient= mongodb.MongoClient;
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.DB||"mongodb://localhost:27017";
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin:"*"
}))

app.use(express.json());

app.post("/create", async function (req,res){
    try {
        let data={};
        data.roomname=req.body.roomname;
        data.seats=req.body.seats;
        data.amenties=req.body.amenties;
        data.price = req.body.price;
        data.isVacant = req.body.isVacant;
        let client = await mongoClient.connect(url);
        let db = client.db('halls');
        await db.collection("hall").insertOne(data);
        await client.close();

        res.json({
            message:"Hall Registered"
        })

    } catch (error) {
        res.status(500).json({
            message:"server error"
        })
    }
})

app.get('/rooms', async function(req,res){
    try {
        let client = await mongoClient.connect(url);
        let db = client.db('halls');
        let data = await db.collection("hall").find({isVacant:true}).toArray();
        await client.close();

        res.json(data)
    } catch (error) {
        res.status(500).json({
            message:"something went wrong"
        })
    }
})
app.post("/book", async function(req,res){
    try {
        let data = {};
        data.name = req.body.name;
        data.date = req.body.date;
        data.start_time = req.body.start_time;
        data.end_time = req.body.end_time;
        data.roomid=req.body.roomid;
        data.bookedstatus=true;
        let client = await mongoClient.connect(url);
        let db = client.db('halls');
        await db.collection("booking").insertOne(data);
        await db.collection("hall").findOneAndUpdate({_id:mongodb.ObjectId(req.body.roomid)},{ $set:{isVacant:false}});
        await client.close();
        res.json({
            message:"Room booked successfully"
        })
    } catch (error) {
        res.json({
            message:"Something went wrong"
        })
    }
})

app.get('/room-data', async function(req,res){
    try {
        let out = [];
        let client = await mongoClient.connect(url);
        let db = client.db('halls');
        let room = await db.collection("hall").find({},{roomname:1}).toArray();
        let data = await db.collection("booking").find().toArray();
        let data2 = [...room,...data]
        await client.close();
        res.status(200).json(data2)
    } catch (error) {
        res.status(404).json({
            message:"not found"
        })
    }
})
app.get("/customer-data", async function(req,res){
    try {
        let client = await mongoClient.connect(url);
        let db = client.db('halls');
        let data = await db.collection("booking").find({},{name:1,roomid:1,date:1,start_time:1,end_time:1}).toArray();
        let roomname = await db.collection('hall').find({_id:data.roomid},{roomname:1}).toArray();
        let data2= [...data,...roomname]
        // data2.push(data,roomname)
        res.status(200).json(data2)
    } catch (error) {
        console.log(error)
        res.status(404).json({
            message:"not found"
        })
    }
})

app.listen(PORT,function(){
    console.log(`This app is listening in port ${PORT}`)
})