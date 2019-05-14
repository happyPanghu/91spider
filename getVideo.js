const request = require("request");
const cheerio = require("cheerio");
const async = require("async");
var mysql = require('mysql');
//创建数据库连接
var connection = mysql.createConnection({
    host: '10.1.200.148',
    user: 'root',
    password: 'root',
    database: 'test'
});
connection.connect();


//定义参数
var urlList = [];

//任务队列
var task = [function(callback) {
    //第一步  查询所有url
    var sql = 'select u.url from url u ';
    connection.query(sql, function(err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            return;
        } else {
            for (var i in result) {
                urlList.push(result[i].url);
            }
            callback(null,urlList);
        }

    });
}, function(urlList, callback) {
    //第二步 循环urlList 多线程
    async.mapLimit(urlList, 1, function(url, callback) {
        visit(url, callback);
    }, function(err, res) {
        console.log(res + "=========返回结果");
    })
}]

// 多线程循环List的实现
function visit(url, callback) {
	var video_url=[];
	//访问页面
	var option={
		url:url,
		headers:{
			'Cookie':'evercookie_cache=<br />; evercookie_png=<br />; evercookie_etag=<br />; l91lb91a=1; show_msg=3; CLIPSHARE=ni345lhevtpsi6hd4bub9kkup2; 91username=guanchunqi; DUID=125ab0XYPISddEwrOOmOcDy%2FBaKRJgxS6wOQfLPh5q8jkMPe; USERNAME=7d9aCSARMJfunr4hCjYp0XDCjfdzbl3XB43rNxsbXXFo52MzCGPs; user_level=1; EMAILVERIFIED=no; level=1; watch_times=5; __utma=152733425.1822074426.1509630927.1512367346.1512370721.8; __utmb=152733425.0.10.1512370721; __utmc=152733425; __utmz=152733425.1509630927.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); AJSTAT_ok_pages=9; AJSTAT_ok_times=6; __tins__3878067=%7B%22sid%22%3A%201512370720942%2C%20%22vd%22%3A%2016%2C%20%22expires%22%3A%201512373442358%7D; __51cke__=; __51laig__=42; __dtsu=1EE704459524FB59645FD55302C3B0EB'
		}
	}
    request(option, function(err, result) {
            if (err) {
                console.log(err);
                return;
            } else {
                var $ = cheerio.load(result.body);
                var vUrl=$("source").attr("src");
                var vName=$("#viewvideo-title").text().trim();
				console.log(vUrl,vName);
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
        console.log(b,cb);
        connection.end();
    });
