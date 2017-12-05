const request=require('request');
var opt = {
 host:'这里放代理服务器的ip或者域名',
 port:'这里放代理服务器的端口号',
 method:'POST',//这里是发送的方法
 path:' https://www.google.com',     //这里是访问的路径
 url:'http://185.38.13.159//mp43/239417.mp4?st=rj1YI3OUDvZY1_5Y8bKFMQ&e=1512444931'
}
    request(url, function(err, result) {
        if (err) {
            console.log(err);
            return;
        } else {
            
        }
    })