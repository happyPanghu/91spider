var request = require("request");
var iconv = require('iconv-lite');
var Promise = require("bluebird");
const cheerio = require("cheerio");

function getProxyList() {
    var apiURL = 'http://www.66ip.cn/areaindex_1/1.html';

    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url: apiURL,
            gzip: true,
            encoding: null,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
                'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
                'referer': 'http://www.66ip.cn/'
            },

        };

        request(options, function(error, response, body) {


            try {

                if (error) throw error;
                var $ = cheerio.load(response.body);
                var ret = [];
                $("#footer table tr").each(function() {
                    var $fa=$(this).find("td");                    
                    ret.push({'ip':$fa.eq(0).text().trim(),'port':$fa.eq(1).text().trim()});
                })
                ret.shift();
                resolve(ret);

            } catch (e) {
                console.log(e);
                return reject(e);
            }


        });
    })
}

var main = {
    getResult: function(callback) {
        getProxyList().then(function(proxyList) {
            callback(proxyList);
        }).catch(e => {
            console.log(e);            
        })
    }
}

module.exports = main;