var initUrl = "http://39.98.91.180:80";

// var initUrl = "http://192.168.0.104:80";

// var initUrl = "http://192.168.3.4:80";

function zlyslay(obj) {
	layer.open({
		content: obj.msg,
		skin: 'msg',
		time: 2
	});
}

function muiHref(obj) {
	layer.open({
		type: 2
	});
	setTimeout(function() {
		window.location.href = obj
	}, 390)
}

function loginOut() {
	$.post(initUrl + "/app/driver/loginOut", {}, function() {
		muiHref("login.html");
	})
}

function my() {
	muiHref("my.html");
}

function index() {
	muiHref("index.html");
}

function person() {
	muiHref("person.html");
}

function mycar() {
	muiHref("mycar.html");
}

function add() {
	muiHref("add.html");
}

function bj() {
	muiHref("bj.html");
}

function bz() {
	muiHref("bz.html");
}

function clear_pwd() {
	muiHref("clear.html");
}

function tz() {
	muiHref("tz.html");
}

function tz_cgj() {
	muiHref("tz_cgj.html");
}

function sytj() {
	muiHref("sytj.html");
}

function sb() {
	layer.open({
		content: '此功能正在升级中',
		skin: 'msg',
		time: 1
	});
}
function warnToday(){
	muiHref("warnToday.html");
}

function dengdai(){
	muiHref("dengdai.html");
}

function myColl(){
	muiHref("myColl.html");
}

//格式化CST日期的字串
function formatCSTDate(strDate, format) {
	return formatDate(new Date(strDate), format);
}

//格式化日期,
function formatDate(date, format) {
	var paddNum = function(num) {
		num += "";
		return num.replace(/^(\d)$/, "0$1");
	}
	//指定格式字符
	var cfg = {
		yyyy: date.getFullYear() //年 : 4位
			,
		yy: date.getFullYear().toString().substring(2) //年 : 2位
			,
		M: date.getMonth() + 1 //月 : 如果1位的时候不补0
			,
		MM: paddNum(date.getMonth() + 1) //月 : 如果1位的时候补0
			,
		d: date.getDate() //日 : 如果1位的时候不补0
			,
		dd: paddNum(date.getDate()) //日 : 如果1位的时候补0
			,
		hh: date.getHours() //时
			,
		mm: date.getMinutes() //分
			,
		ss: date.getSeconds() //秒
	}
	format || (format = "yyyy-MM-dd hh:mm:ss");
	return format.replace(/([a-z])(\1)*/ig, function(m) {
		return cfg[m];
	});
}

window.onload = function() {
	zlysAll();
}

function zlysAll(){
	$.post(initUrl + "/app/driver/isOnline", {}, function(obj) {
		if(obj.state == 0){
			muiHref("login.html");
		}
	})
}
