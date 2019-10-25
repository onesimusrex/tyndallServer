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

    getMongoClient (response, req.query.keyword);
    // MongooseCallback(response)
    // console.log("data api contacted")
});

function getMongoClient(response, keyword){
    const dbName = "tyndall1"
    const client = new MongoClient(url, {useNewUrlParser: true});

    client.connect (function (err){
        // assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db("tyndall1");
        // insertDocuments
        //console.log(db)
        // insertDocuments(db, console.log)
        FindKeyword(db, response, keyword)
        client.close();
    })
}
function FindKeyword (db, response, keyword){
    //https://stackoverflow.com/questions/15136016/how-can-i-sort-by-elemmatch-in-mongodb
    // {keywords: {$all: [ {text: "permanent global positioning system"} ] }}
    var re = new RegExp(keyword,"i")
    const collection = db.collection("entries");
    collection.find( {keywords: {$elemMatch: {text: re}} } ).toArray(function (err, result){
    // collection.find( {keywords: {$elemMatch: {text: re}} } ).sort({keywords: {$elemMatch: {relevance: -1}} }).toArray(function (err, result){
        var payload = JSON.stringify(result)
        console.log(payload)
        response.send(payload)
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