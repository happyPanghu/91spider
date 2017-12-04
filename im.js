
const main = require("./proxy");

let proxyIpList=[];
main.getResult(function(result){
	proxyIpList=result;
	console.log(proxyIpList);
})
