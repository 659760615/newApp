<!-- xl -->
window.onload = function() {
	let container = document.querySelector('#refreshContainer');
	let refreshText = document.querySelector('.refreshText');
	let parent = document.querySelector('.parent');
	let startY = 0; //手指触摸最开始的Y坐标
	let endY = 0; //手指结束触摸时的Y坐标
	parent.addEventListener('touchstart', function(e) {
		startY = e.touches[0].pageY;
	});
	parent.addEventListener('touchmove', function(e) {
		if (isTop() && (e.touches[0].pageY - startY) > 0) {
			console.log('下拉了');
			// refreshText.style.height = "50px";
			parent.style.transform = "translateY(50px)";
			parent.style.transition = "all ease 0.5s";
			refreshText.innerHTML = "释放立即刷新...";
		}
	});
	parent.addEventListener('touchend', function(e) {
		if (isTop()) {
			refreshText.innerHTML = "正在刷新...";
			setTimeout(function() {
				parent.style.transform = "translateY(0)";
				console.log('成功刷新');
				// location.reload();
				refreshText.innerHTML = "";
			}, 1500)
		}
		return;
	})

	function isTop() {
		var t = document.documentElement.scrollTop || document.body.scrollTop;
		return t === 0 ? true : false;
	}
}
