var express = require('express');
var router = express.Router();
const request = require('superagent');
var ifsData = require('../utils/dataUtil1.js')
var MongoClient = require('mongodb').MongoClient;
const assert = require('assert')

router.get('/', function(req, response, next) {
    var payload = GetCMSPayload(req.query.type, response);    
});

function GetCMSPayload(query, response){
    request
        .get('https://apps.elegantcms.io/api/v1/contents')
        .set('Authorization', "Token token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBfdXVpZCI6ImY2OGE5YWUxLTJmOTgtNGQ1MC05YTBmLWY5YzQ1NzQ2MDAwOSIsImlkIjoxMzQxLCJ1cGRhdGVkX2F0IjoiMjAxOS0xMC0wOCAxNzoyMToyNSBVVEMifQ.nb06rtKF8vRTycyOG48KdNP1oZ92SuzJtax8eS6WJuY")
        .query("filter[type]="+query)
        .then(function (res){

            if (query == 'pdfs'){
                request
                    .get(JSON.parse(res.text).data[0].attributes.fields.ifspdf.url)
                    .then(function(txtfile){
                        // console.log(txtfile.text)
                        // console.log("ha")
                        console.log("process" + ifsData.init(txtfile.text, response));
                        // response.send(JSON.stringify({text: txtfile}))
                        // response.send( JSON.stringify({json: ifsData.init(txtfile.text)} ) )
                    })
            } else {
                _data = JSON.parse(res.text);
                // console.log(_data)
                _dataObj = _data.data[0].attributes.fields;
                // for (var i in _data.data){
                //     console.log(_data.data[i].attributes)
                // } 
                // console.log(_dataObj)
                _dataStringified = JSON.stringify(_dataObj)
                // console.log(res)
                // res.send(_dataText);
                // console.log(_dataStringified)
                response.send(_dataStringified)
                // console.log(_dataObj.title)
            }

        })
}

module.exports = router;