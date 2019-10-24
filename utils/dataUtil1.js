function ifsData () {
    this.init = init;
    this.data = {};
    this.ElimCategoryText = ElimCategoryText;
    this.GetHeadings = GetHeadings;
    this.GetKeywordRelevance = GetKeywordRelevance;
    this.AddNlpFeature = AddNlpFeature;
    this.ProcessIFSData = ProcessIFSData;
    this.nlp = nlp;
}

function init (ifsText){
    str = "\`"+ifsText+"\`"
    superagent = require ('superagent');
    const NaturalLanguageUnderstandingV1 = require ('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require ('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2019-07-12',
        authenticator: new IamAuthenticator({ apikey: 'Asrl_esdUauoAsbVmTG5KxM8BaiqCpBo2rpqY08XCSqN'}),
        url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
    })


    // returns patterns that matche 6 digit csi code and document header
    var csiPattern = /([\n][\d]{2}[\s][\d]{2}[\s][\d]{2})/gm;
    var headerPattern = /[\w]*[\s]*[\d]*[\s]*IFS Design Guide Appendix \| Rough Draft\s*\w*\s*\d*\s*\d*\s*[\w]*[\s]*[\d]*[\s]*[\d]*/gm
    var divisionHeading = /(DIVISION[\s]*[\d]*(?:[\s]*[A-Z]*(?:,)?)*[\s])/gm

    words = str.split(csiPattern);
    words = words.slice(1);
    data = []        

    for (i=0;i<words.length;i=i+2){
        if (i == 0){
            var header1 = words[i].slice(1).split("\n")
            var headerBod = header1.slice(1).join(" ").split(headerPattern).join("")
            heading1 = this.GetHeadings(headerBod, divisionHeading)
            if (heading1){
                data.push(heading1);
            }
        }
        
        var text = words[i+1].slice(1).split("\n")
        var body = text.slice(1).join(" ").split(headerPattern).join("")
        
        words[i] = words[i].slice(1); 
        data.push({
            type: "subcategory",
            csi: words[i],
            l1: words[i].slice(0,2),
            l2: words[i].slice(3,5),
            l3: words[i].slice(6),
            title: text[0],
            body: body
        })
        //delete redundant heading text
        heading = this.GetHeadings(body, divisionHeading)
        if (heading){
            data.push(heading);
        }
    }


    this.ElimCategoryText(data)
    _this = this;

    this.ProcessIFSData(naturalLanguageUnderstanding, _this);

}

function ElimCategoryText(_data){
    for (var i=0; i<_data.length; i++){
        if (_data[i].type == "category"){
            bodySplit = _data[i-1].body.split(divisionHeading);
            _data[i-1] = bodySplit[0].trim();
            _word = _data[i].csi = _data[i+1].csi;
            _data[i].l1 = _word.slice(0,2)
            _data[i].l2 = _word.slice(3,5)
            _data[i].l3 = _word.slice(6)
        }
    }
}

function GetHeadings (body, _divisionHeading ){
    if (_divisionHeading.test(body)){
        bodySplit = body.split(_divisionHeading);
        body = bodySplit[0]
        var _text = bodySplit.slice(-1).join("")
        var headingArr = bodySplit.slice(1,-1).join("")
        if (_text.split(" ").length == 1){
            _text = "";
        }
        return {
            type: "category",
            csi: null,
            title: headingArr.trim(),
            body: _text
        };
    }
}

function AddNlpFeature(_analysisResults, dataitem){
    var ibmReturnTime = new Date() 
    // console.log("send time: " +ibmReturnTime.toString())    
    nlpData = {};
    featureTypes = ["keywords", /*"entities",*/ "concepts"]
    // console.log(_analysisResults["keywords"])
    for (var i=0; i<featureTypes.length; i++){
        var nlpType = nlpData[featureTypes[i]] = []
        // console.log(nlpType)
        var ft = featureTypes[i]
        for (var j=0; j<_analysisResults[featureTypes[i]].length; j++){
            var featureItem = _analysisResults[featureTypes[i]][j];
            var tempObj = {
                text: featureItem.text,
                relevance: featureItem.relevance,
                
            }
            if (featureTypes[i] == "entities"){
                tempObj["type"] = featureItem.type
                tempObj["count"] = featureItem.count
                tempObj["mentions"] = []
                for(var k=0; k<featureItem.mentions.length; k++){
                    tempObj["mentions"].push({
                        text: featureItem.mentions[k].text,
                        location: [featureItem.mentions[k].location[0], featureItem.mentions[k].location[1]],
                        confidence: featureItem.mentions[k].confidence
                    })
                }
            }
            // nlpType.push(tempObj)
            nlpData[featureTypes[i]].push(tempObj)
        }
    }
    dataitem["keywords"] = nlpData["keywords"]
    dataitem["concepts"] = nlpData["concepts"]
    // console.log("mutated data entry: ")
    // console.log(dataitem)
    // return nlpData;



    mongo2(dataitem)
    return dataitem;
}

function mongo2(dataitem, mongoClient){
    var MongoClient = require('mongodb').MongoClient;
    const assert = require('assert')
    var url = 'mongodb+srv://jacobs:Jacobs123@cluster0-rjppa.azure.mongodb.net/test?retryWrites=true&w=majority'
    const dbName = "tyndall1"
    const client = new MongoClient(url, {useNewUrlParser: true});

    client.connect (function (err){
        // assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db("tyndall1");
        // insertDocuments
        //console.log(db)
        insertDocuments(db, console.log, dataitem)
        client.close();
    })
}

function insertDocuments (db, callback, dataitem){
    const collection = db.collection("entries");
    collection.insertMany([
        dataitem
    ], function (err, result){
        // assert.equal(err, null);
        // callback(result)
    })
}

function ProcessIFSData(naturalLanguageUnderstanding, _this) {
    // /*
    for (var i=0; i<data.length; i++){
        if (data[i].body != ''  && data[i].body != "\r"){
            console.log(data[i])
            // if (data[i].csi == '08 71 00'){
            //prints the data item
            // console.log(data[i].csi + '\n' + data[i].title + '\n' + data[i].body)
            this.GetKeywordRelevance(data[i].body, 30, naturalLanguageUnderstanding, data[i]);
        }
        
    }
    // _this = this
    // _count = data.length - 1
    // this.nlp(data, naturalLanguageUnderstanding, _count, _this)
}

function nlp(data, naturalLanguageUnderstanding, _count, _this){
    if (data[_count].body != ''  && data[_count].body != "\r"){
        _this.GetKeywordRelevance(data[_count].body, 25, naturalLanguageUnderstanding, data[_count]);
        _count--
        if (_count >= 0){
            setTimeout (nlp(data, naturalLanguageUnderstanding, _count), 200)
        }
    } else {
        _count--
        if (_count >= 0){
            setTimeout (nlp(data, naturalLanguageUnderstanding, _count), 200)
        }
    }
}

function GetKeywordRelevance(_text, num, nlu, dataitem){
    var analyzeParams = {
        // 'url': 'www.nytimes.com',
        text: _text,
        'features': {
            'keywords': {
                'limit': num
            },
            'relations': {},
            'entities': {
                'limit': num,
                'mentions': true
            },
            'concepts': {
                'limit': num
            }
        }
    }
    var ibmSendTime = new Date() 
    // console.log("send time: " +ibmSendTime.toString())
    _this = this;
    nlu.analyze(analyzeParams)
        .then(analysisResults => {
            // console.log(JSON.stringify(analysisResults.result, null, 2))
            // console.log(this)
            _this.AddNlpFeature(analysisResults.result, dataitem)
            // console.log(_this.AddNlpFeature(analysisResults.result, dataitem));
            // return _this.AddNlpFeature(analysisResults.result);
        })
        .catch(err => {
            console.log('error', err);
        })
}

//loads text data

module.exports = new ifsData();







// console.log(AddNlpFeature())
// console.log(data)
