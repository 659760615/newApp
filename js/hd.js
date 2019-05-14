
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

				/* 连接蓝牙 */
				// connectDevice(bss[bss.length - 1].deviceId);
				/* 服务 */


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
		var value = buffer2hex(e.value);
		if (characteristicId == e.characteristicId) {
			// 更新到页面显示
			// document.getElementById('readvalue').value = value;
			// document.getElementById('czx').innerHTML = value;

		} else if (wcharacteristicId == e.characteristicId) {
			plus.nativeUI.toast(value);
		}
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
		var id = localStorage.getItem("ly");
		if (!id) {
			plus.bluetooth.openBluetoothAdapter({
				success: function(e) {
					/* 搜索蓝牙 */
					startDiscovery();
				},
				fail: function(e) {
					plus.nativeUI.toast('打开失败!');
				}
			});
		}else{
			 connectDevice(id);
			 // zlysBlue(id);
		}
        flag = false;
        setTimeout('flag = true',5000);
    }else{
        plus.nativeUI.toast('连接中...');
    }
}

// 开始搜索蓝牙设备 
function startDiscovery() {
	plus.bluetooth.startBluetoothDevicesDiscovery({
		success: function(e) {
			// plus.nativeUI.toast('搜索成功!');
		},
		fail: function(e) {
			plus.nativeUI.toast('搜索失败!');
		}
	});
}



// 断开蓝牙设备
function disconnectDevice() {

	var id = localStorage.getItem("ly");
	if (!id) {
		return;
	}
	plus.bluetooth.closeBLEConnection({
		deviceId: id,
		success: function(e) {
			console.log('关闭蓝牙连接:' + id)
		},
		fail: function(e) {}
	});
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
	bds = [];
	deviceId = null;
	bss = [];
	bscs = [];
	bscws = [];
	characteristicId = null;
	wcharacteristicId = null;
}

// 连接蓝牙设备 
function connectDevice(obj) {
	plus.bluetooth.createBLEConnection({
		deviceId: obj,
		success: function(e) {
			plus.nativeUI.toast('连接成功!');
			localStorage.setItem("ly", obj);
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
function getServices(obj){
	plus.bluetooth.getBLEDeviceServices({
		deviceId: obj,
		success: function(e){
			var services = e.services;
			if(services.length>0){
				for(var i in services){
					bss.push(services[i]);
				}
				if(bss.length>0){	// 默认选择最后一个服务
					serviceId = bss[bss.length-1].uuid;
				}
			}
		}
	});
}

// 获取服务的特征值 
function getCharacteristics(deviceId,serviceId){
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
									},
									fail: function(e){
									}
								});
							}
						}
					}
				}
				if(bscws.length>0){	// 默认选择最后一个可写特征值
					wcharacteristicId = bscws[bscws.length-1].uuid;
				}
			}
		}
	});
}

// 读取特征值数据 
function readValue(deviceId,serviceId,characteristicId){
	plus.bluetooth.readBLECharacteristicValue({
		deviceId: deviceId,
		serviceId: serviceId,
		characteristicId: characteristicId,
		success: function(e){
			plus.nativeUI.toast('读取数据成功!');
		},
		fail: function(e){
			plus.nativeUI.toast('读取数据失败! '+JSON.stringify(e));
		}
	});
}
/*  */
function zlysBlue(obj){
	getServices(obj);
	getCharacteristics(obj,serviceId);
	readValue(obj,serviceId,wcharacteristicId);
}