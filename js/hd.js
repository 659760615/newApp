
var flag = true;
var bds = []; // 可连接设备列表
var deviceId = null,
	bconnect = false;
var bss = []; // 连接设备服务列表
var serviceId = null;
var bscs = []; // 连接设备服务对应的特征值列表
var characteristicId = null;
var bscws = []; // 可写特征值列表
var wcharacteristicId = null;
var count = 0;
var statebbb = 0;

var bbb = [] //数据

// 页面初始化操作 
document.addEventListener('plusready', function(e) {
	// 监听蓝牙适配器状态变化
	plus.bluetooth.onBluetoothAdapterStateChange(function(e) {});
	//  监听搜索到新设备 
	plus.bluetooth.onBluetoothDeviceFound(function(e) {
		var devices = e.devices;
		for (var i in devices) {
			var device = devices[i];
			if (device.deviceId && device.name && device.name.length > 0 && device.name != 'null') {
				bds.push(device);
			}
		}
		if (!bconnect && bds.length > 0) { // 默认选择最后一个
			var n = bds[bds.length - 1].name;

			if (n.substr(0, 2) == "HD") {
				/* 停止搜索蓝牙 */
				stopDiscovery();
				
				bss.push(bds[bds.length - 1]);
				//底部对话框
				layer.open({
					content: '是否连接'+bss[bss.length - 1].name,
					btn: ['确定', '取消'],
					skin: 'footer',
					yes: function(index) {
						connectDevice(bss[bss.length - 1].deviceId);
						layer.close(index);
					}
				});


			}
			if (!n || n.length <= 0) {
				n = bds[bds.length - 1].deviceId;
			}
			// document.getElementById('deivce').value = n;
			deviceId = bds[bds.length - 1].deviceId;
		}
	});
	//  监听低功耗蓝牙设备连接状态变化 
	plus.bluetooth.onBLEConnectionStateChange(function(e) {
		if (deviceId == e.deviceId) { // 更新连接状态
			bconnect = e.connected;
		}
	});
	// 监听低功耗蓝牙设备的特征值变化 
	plus.bluetooth.onBLECharacteristicValueChange(function(e) {
		buffer2hex(e.value);
		getCharacteristics();
	});
}, false);

// 打开蓝牙 
function openBluetooth() {
	if(flag){
		/* 断开本地蓝牙连接 */
		disconnectDevice()
		/* 关闭蓝牙 */
		// closeBluetooth();
		/* 重置 */
		resetDevices();
		/* 本地蓝牙 */
		plus.bluetooth.openBluetoothAdapter({
			success: function(e) {
				/* 搜索蓝牙 */
				startDiscovery();
			},
			fail: function(e) {
				plus.nativeUI.toast('打开失败!');
			}
		});

        flag = false;
        setTimeout('flag = true',10000);
    }else{
		count = count + 1 ;
		if(count > 3){
			plus.nativeUI.toast('请重新打开蓝牙...');
			count = 0;
			location.reload();
		}else{
			plus.nativeUI.toast('连接中...');
		}
    }
}

// 开始搜索蓝牙设备 
function startDiscovery() {
	plus.bluetooth.startBluetoothDevicesDiscovery({
		success: function(e) {
			plus.nativeUI.toast('正在搜索!');
		},
		fail: function(e) {
			plus.nativeUI.toast('搜索失败!');
		}
	});
}



// 断开蓝牙设备
function disconnectDevice() {
	console.log(bconnect);
	if (bconnect) {
		plus.bluetooth.closeBLEConnection({
			deviceId: deviceId,
			success: function(e) {
				console.log('关闭蓝牙连接:' + deviceId)
				bconnect = false;
			},
			fail: function(e) {}
		});
	}
}

// 关闭蓝牙
function closeBluetooth() {
	plus.bluetooth.closeBluetoothAdapter({
		success: function(e) {
			console.log('关闭蓝牙')
		},
		fail: function(e) {}
	});
}

// 重设数据 
function resetDevices() {
	bbb = [];
	bds = [];
	deviceId = null;
	bss = [];
	bscs = [];
	bscws = [];
	characteristicId = null;
	wcharacteristicId = null;
	statebbb= 0;
}

// 连接蓝牙设备 
function connectDevice(obj) {
	plus.bluetooth.createBLEConnection({
		deviceId: obj,
		success: function(e) {
			console.log('连接成功!');
			bconnect = true;
			localStorage.setItem("ly", obj);
			/* 解析数据 */
			var id = localStorage.getItem("ly");
			getServices(obj);
		},
		fail: function(e) {
			plus.nativeUI.toast('连接失败! ');
		}
	});
}

// 停止搜索蓝牙设备 
function stopDiscovery(){
	plus.bluetooth.stopBluetoothDevicesDiscovery({
		success: function(e){
		},
		fail: function(e){
		}
	});
}


// 获取设备服务 
function getServices(){
	plus.bluetooth.getBLEDeviceServices({
		deviceId: deviceId,
		success: function(e){
			var services = e.services;
			if(services.length>0){
				for(var i in services){
					bss.push(services[i]);
				}
				if(bss.length>0){	// 默认选择最后一个服务
					serviceId = bss[bss.length-1].uuid;
					console.log('获取服务成功! '+serviceId);
					getCharacteristics();
				}
			}else{
				console.log('获取服务列表为空?');
			}
		},
		fail: function(e){
			console.log('获取服务失败! '+JSON.stringify(e));
		}
	});
}

// 获取服务的特征值 
function getCharacteristics(){
	bscs = [];
	bscws = [];
	plus.bluetooth.getBLEDeviceCharacteristics({
		deviceId: deviceId,
		serviceId: serviceId,
		success: function(e){
			var characteristics = e.characteristics;
			if(characteristics.length>0){
				for(var i in characteristics){
					var characteristic = characteristics[i];
					if(characteristic.properties){
						if(characteristic.properties.read){
							bscs.push(characteristics[i]);
						}
						if(characteristic.properties.write){
							bscws.push(characteristics[i]);
							if(characteristic.properties.notify||characteristic.properties.indicate){
								plus.bluetooth.notifyBLECharacteristicValueChange({	//监听数据变化
									deviceId: deviceId,
									serviceId: serviceId,
									characteristicId: characteristic.uuid,
									success: function(e){
										// console.log('notifyBLECharacteristicValueChange '+characteristic.uuid+' success.');
									},
									fail: function(e){
									}
								});
							}
						}
					}
				}
				if(bscs.length>0){	// 默认选择最后特征值
					characteristicId = bscs[bscs.length-1].uuid;
				}
				if(bscws.length>0){	// 默认选择最后一个可写特征值
					wcharacteristicId = bscws[bscws.length-1].uuid;
				}
			}else{
				console.log('获取特征值列表为空?');
			}
		},
		fail: function(e){
			console.log('获取特征值失败! '+JSON.stringify(e));
		}
	});
}
// 读取特征值数据 
function readValue(){
	plus.bluetooth.readBLECharacteristicValue({
		deviceId: deviceId,
		serviceId: serviceId,
		characteristicId: characteristicId,
		success: function(e){
			console.log('读取数据成功!');
		},
		fail: function(e){
			plus.nativeUI.toast('读取数据失败! '+JSON.stringify(e));
		}
	});
}


function buffer2hex(value){
	if(value){
		var v=new Uint8Array(value);
		for(var i = 0 ; i < v.length ; i++){
			if( i < v.length){
				if(v[i].toString(16) == 'f9' && v[i+1].toString(16) == '51'){
					statebbb = 1 ; 
					}
				if(v[i].toString(16) == '9f' && v[i+1].toString(16) == '15'){
					statebbb = 0;
					// console.log(bbb.length+":"+bbb);
					/* 解释 */
					zlysBlueX(bbb);
					bbb = [];
				}
			}
			if(statebbb == 1){
				bbb.push(v[i].toString(16));
			}
		}
		
	}
}


function zlysBlueX(obj){
	var t = obj[29]+obj[30]+obj[31]+obj[32];
	// console.log(t);
	var h = obj[25]+obj[26]+obj[27]+obj[28];
	var hh = HexToSingle(h);
	console.log(hh);
	$("#kgNow").html("&nbsp" + hh);
}






function HexToSingle(t) {
    t = t.replace(/\s+/g, "");
    if (t == "") {
        return "";
    }
    if (t == "00000000") {
        return "0";
    }
    if ((t.length > 8) || (isNaN(parseInt(t, 16)))) {
        return "Error";
    }
    if (t.length < 8) {
        t = FillString(t, "0", 8, true);
    }
    t = parseInt(t, 16).toString(2);
    t = FillString(t, "0", 32, true);
    var s = t.substring(0, 1);
    var e = t.substring(1, 9);
    var m = t.substring(9);
    e = parseInt(e, 2) - 127;
    m = "1" + m;
    if (e >= 0) {
        m = m.substr(0, e + 1) + "." + m.substring(e + 1)
    }
     else {
        m = "0." + FillString(m, "0", m.length - e - 1, true)
    }
    if (m.indexOf(".") == -1) {
        m = m + ".0";
    }
    var a = m.split(".");
    var mi = parseInt(a[0], 2);
    var mf = 0;
    for (var i = 0; i < a[1].length; i++) {
        mf += parseFloat(a[1].charAt(i)) * Math.pow(2, -(i + 1));
    }
    m = parseInt(mi) + parseFloat(mf);
    if (s == 1) {
        m = 0 - m;
    }
    return m;
}

function FillString(t, c, n, b) {
    if ((t == "") || (c.length != 1) || (n <= t.length)) {
        return t;
    }
    var l = t.length;
    for (var i = 0; i < n - l; i++) {
        if (b == true) {
            t = c + t;
        }
         else {
            t += c;
        }
    }
    return t;
}

function guanbi(){
	/* 停止搜索蓝牙 */
	stopDiscovery();
	disconnectDevice();
	closeBluetooth();
}