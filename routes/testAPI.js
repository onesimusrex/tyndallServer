var express = require('express');
var router = express.Router();
const request = require('superagent');

router.get('/', function(req, response, next) {
    var payload = GetCMSPayload(response);    
});

function GetCMSPayload(response){
    request
        .get('https://apps.elegantcms.io/api/v1/contents')
        .set('Authorization', "Token token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBfdXVpZCI6ImY2OGE5YWUxLTJmOTgtNGQ1MC05YTBmLWY5YzQ1NzQ2MDAwOSIsImlkIjoxMzQxLCJ1cGRhdGVkX2F0IjoiMjAxOS0xMC0wOCAxNzoyMToyNSBVVEMifQ.nb06rtKF8vRTycyOG48KdNP1oZ92SuzJtax8eS6WJuY")
        .then(function (res){
            _data = JSON.parse(res.text);
            // console.log(_data.data)
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
        })
}

module.exports = router;