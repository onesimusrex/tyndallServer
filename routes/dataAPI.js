var express = require('express');
var router = express.Router();
const request = require('superagent');
// var ifsData = require('../utils/dataUtil1.js')
var MongoClient = require('mongodb').MongoClient;
// var mongoose = require('mongoose');
const assert = require('assert')

var url = 'mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority'

router.get('/', function(req, response, next) {
    // var payload = GetCMSPayload(req.query.type, response);    
    // QueryMongoDB (response)

    mongo2 (response);
    // MongooseCallback(response)
    // console.log("data api contacted")
});

function mongo2(response){
    const dbName = "tyndall1"
    const client = new MongoClient(url, {useNewUrlParser: true});

    client.connect (function (err){
        // assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db("tyndall1");
        // insertDocuments
        //console.log(db)
        // insertDocuments(db, console.log)
        FindKeyword(db, console.log)
        client.close();
    })
}
function FindKeyword (db, callback){

    // {keywords: {$all: [ {text: "permanent global positioning system"} ] }}
    const collection = db.collection("entries");
    collection.find( {csi:  "03 30 00"} ).toArray(function (err, result){
        console.log(JSON.stringify(result))
    })
}
function insertDocuments (db, callback){
    const collection = db.collection("entries");
    collection.insertMany([
        {_idx: 20, name: "hamburger"},
        {_idx: 40, name: "taco"}
    ], function (err, result){
        // assert.equal(err, null);
        callback(result)
    })
}

function QueryMongoDB (response){
    MongoClient.connect('mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority', (err, database) => {
        //start the server
        // mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority
        // response.send(database)
        console.log(database.db("tyndall1").entries)
        // var collect1 = database.db("cluster0").collect1;
        // collect1.insert_one({
        //     "_id": 1,
        //     "name": "pizza",
        //     "year": "2019"
        // })
        
    })
}



// function MongooseCallback (response){
//     var mongoose.connect('mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

// }

module.exports = router;