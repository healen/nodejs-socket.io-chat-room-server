var http=require("http"),//引入HTTP模块 ， 用于创建服务器
    fs=require("fs"),//引入文件模块， 用于操作读取文件
    url=require("url");//引入URL模块， 用于分析请求路径控制路由规则
var userline=0; //用户在线数量，默认为 0

/*通过http模块创建 node服务器*/
var server=http.createServer(function(req,res){
  var pathname=url.parse(req.url).pathname;//分析请求URL
  if(pathname=="/"||pathname=="/index"){//如果请求路径是 "/" 或者 "/index"执行
    fs.readFile("./index.html","utf-8",function(err,data){//读取文件
      if(!err){
      	/*如果读取文件成功设置http响应头
		 *把读取文件的数据返回到服务器
      	*/
        res.writeHead(200,{"Content-Type":"text/html"});
        res.end(data);
      }
    });
  }
}).listen(3002,"10.8.8.110");//设置端口 以及本机IP可以让其他机器通过局域网访问服务器




/*聊天室的核心，引入socket.io 并且监听server服务器*/
var io=require('socket.io').listen(server);
console.log("10.8.8.110:3002");

/*socket*/
var nicknames=[];
io.sockets.on("connection",function(socket){//链接socket
	socket.on("nickname",function(data,callback){//接收客户端发送过来的 nickname数据
		socket.nickname=data;//昵称字符串
		if(nicknames.indexOf(socket.nickname)!=-1){//判断昵称是否存在
			callback(false);
			console.log("用户名已存在");
		}else{
			callback(true);
			nicknames.push(data);//把客户端发来的数据插入到数组
			socket.nickname=data;
			socket.emit("nicknames",nicknames);//吧数据发送到客户端
			socket.broadcast.emit("nicknames",nicknames);//实现实时通信
			console.log("添加成功");
		}
	})
	socket.on("sendmsg",function(data){//接搜消息
		socket.emit("use msg",{
			mes:data,
			nick:socket.nickname
		});

		socket.broadcast.emit("use msg",{
			mes:data,
			nick:socket.nickname
		})
	})
	socket.on("disconnect",function(){//广播数据
		if(!socket.nickname) return;
		if(nicknames.indexOf(socket.nickname)>-1){
			nicknames.splice(nicknames.indexOf(socket.nickname),1);
		}
		socket.emit("nicknames",nicknames);
		socket.broadcast.emit("nicknames",nicknames);
		console.log(nicknames);
	});
})