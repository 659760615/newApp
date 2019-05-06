var initUrl = "http://39.98.91.180:80";

// var initUrl = "http://192.168.0.104:80";

// var initUrl = "http://192.168.3.4:80";

function zlyslay(obj){
	layer.open({
		content: obj.msg,
		skin: 'msg',
		time: 2
	});
}

function muiHref(obj){
	//loadingå±
    layer.open({type: 2});
	setTimeout(function(){window.location.href = obj},390)
}

function loginOut(){
	$.post(initUrl+"/app/driver/loginOut",{},function(){
		muiHref("login.html");
	})
}
function index(){
	muiHref("index.html");
}