const main = require("./fetchProxy");
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


//定义参数
var urlList = [];

//任务队列
var task = [function(callback) {
    main.getResult(function(result) {
        callback(null,result)
    })
}, function(res,callback) {
    //第一步  查询所有url
    var sql = 'select u.url from url u ';
    var data=[];
    connection.query(sql, function(err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            return;
        } else {
            for (var i in result) {
                urlList.push(result[i].url);
            }   
            data.push(urlList);
            data.push(res);
            callback(null, data);
        }

    });
}, function(data, callback) {
    //第二步 循环urlList 多线程
    var urlList=data[0];
    var res=data[1];
    let time=0;
    var cdata=[];
    async.mapLimit(urlList, 1, function(url, callback) {
    	time++;
    	//每第9次访问   更换代理ip
		cdata.push(res[Math.floor(time/9)]);
		cdata.push(url);
		console.log(cdata);
        visit(cdata, callback);
    }, function(err, res) {
        console.log(res + "=========返回结果");
    })
}]

// 多线程循环List的实现
function visit(data, callback) {
    var video_url = [];
    //访问页面
    var option = {
        url: data[1],
        proxy:'http://'+data[0].ip,
        port:data[0].port
    }
    request(option, function(err, result) {
        if (err) {
            console.log(err);
            return;
        } else {
            var $ = cheerio.load(result.body);
            var vUrl = $("source").attr("src");
            var vName = $("#viewvideo-title").text().trim();
            console.log(vUrl, vName);
            connection.query('INSERT INTO video(url,name) VALUES(?,?)', [vUrl, vName], function(err, result) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    return;
                } else {
                    console.log('--------------------------INSERT----------------------------');
                }
                callback();
            });
        }
    })
}

//执行顺序控制
async.waterfall(task, function(b, cb) {
    console.log(b, cb);
    connection.end();
});