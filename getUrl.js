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
console.log('=========' + urlList.length + '============');


//控制请求发送
async.mapLimit(urlList, 12, function(url, callback) {
    fetchUrl(url, callback);
}, function(err, res) {
    console.log(res + "=========返回结果");
})

//真正爬取插入
function fetchUrl(url, callback) {
    request(url, function(err, result) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log(url);
            var $ = cheerio.load(result.body);
            console.log($('#fullbox-content .listchannel').length);
            $('#fullbox-content .listchannel').each(function(index, element) {
                console.log("****************************");
                var aUrl = $(this).find("a").eq(0).attr("href");
                var aName = $(element).find("a").find("span").text();                
                connection.query('INSERT INTO url(url,name) VALUES(?,?)', [aUrl, aName], function(err, result) {
                    insertTime++;
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        return;
                    } else {
                        console.log('--------------------------INSERT----------------------------' + insertTime);
                    }
                    
                });
            }) 
            callback(null, url);           
        }
    })
}