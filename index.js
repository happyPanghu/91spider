const request = require("request");
const cheerio = require("cheerio");
const async = require("async");
var mysql = require('mysql');
//创建数据库连接
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: '91db'
});
connection.connect();


//定义基本参数
var page = 0;
var max = 115;
let insertTime = 0;

//获取所有带访问链接
var urlList = [];
for (var i = 1; i <= max; i++) {
    urlList.push('http://91.91p09.space/video.php?category=rf&page=' + i);
}
//发送请求
console.log(urlList.length);
async.mapLimit(urlList,115, function(url, callback) {
	callback(null,url);
},function(err,url){
	console.log(url);
	    request(url, function(err, result) {
        page++;
        console.log("============================" + page);
        if (err) {
            console.log(err);
            return;
        } else {
            var $ = cheerio.load(result.body);
            $('#fullbox-content .listchannel').each(function(index, element) {
                var aUrl = $(this).find("a").eq(0).attr("href");
                var aName = $(element).find("a").find("span").text();
                insert([aUrl, aName], callback);
            })
        }
    })
})

function insert(addSqlParams, callback) {
    insertTime++;
    connection.query('INSERT INTO url(url,name) VALUES(?,?)', addSqlParams, function(err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            return;
        }

        console.log('--------------------------INSERT----------------------------' + insertTime);
    	
    });
}