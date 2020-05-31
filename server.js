//'use strict';
const port = 1337;
const hostname = "127.0.0.1";

const mysql = require("mysql");
const fs = require("fs");
const util = require("util");

const userInfo = JSON.parse(fs.readFileSync("database-info.json", { enconding: "utf8" }));
console.log("logging in to MySQL using", userInfo);

var conn = mysql.createConnection({
    host: userInfo["Hostname"],
    user: userInfo["Username"],
    password: userInfo["Password"],
    database: userInfo["Database"]
});

conn.connect((err) => {
    if (err) throw err;
    console.log("logged in!");
});

const express = require('express');
const app = express();

//Process the GET request from the client, return a randomized list stored in wordList.json.
app.get('/words', (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    data = JSON.parse(fs.readFileSync("wordList.json", { encoding: "utf8" }));
    let result = { "positiveWords": new Array(), "otherWords": new Array() };
    for (let i = 0; i < 50; i++) {
        var num = getRandInt(0, data["positiveWords"].length);
        result["positiveWords"].push(removeAt(data["positiveWords"], num));
        result["otherWords"].push(removeAt(data["otherWords"], getRandInt(0, data["otherWords"].length)));
    }
	return res.send(result);
});

function removeAt(arr, index) {
    let temp = arr[index];
    arr[index] = arr[arr.length - 1];
    arr[arr.length - 1] = temp;
    return arr.pop();
}

function getRandInt(start, end) {
    return Math.floor(start + Math.random() * (end - start));
}

//Process POST requests from the client, and return 
app.post('/save', (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });
    req.on("end", () => {
        console.log(data.toString());
        data = JSON.parse(data);
        var sql = util.format('INSERT INTO users (device, requestAddr, requestTime) VALUES ("%s", "%s", NOW());', conn.escape(req.header("user-agent")), req.header("origin"));
        conn.query(sql);
        conn.query("SET @last_insert_id=last_insert_id()");
        sql = util.format('INSERT INTO trials (UserID, TopTimeAvg, BotTimeAvg, TimeAvg, Accuracy) VALUES (@last_insert_id, %d, %d, %d, %d)',
            data["topTime"], data["botTime"], data["avgTime"], data["accuracy"]
        );
        conn.query(sql);
    });
    
    return res.send("{\"response\":\"save received post request.\"}");
});

app.use("/", express.static("wwwroot"));
app.use(express.static("assets"));

app.listen(port, hostname);
console.log("Start listening on", hostname + ":" + port);