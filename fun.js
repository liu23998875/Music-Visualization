//创建元素
function createEle(tagName, content, attrib) {
	var tagName = tagName || "div";
	var attrib = attrib || null;
	var content = content || "";
	var ele = document.createElement(tagName);
	var textNode = document.createTextNode(content);
	ele.appendChild(textNode);
	for (var key in attrib) {
		ele.setAttribute(key, attrib[key]);
	}
	return ele;
}

//事件监听 addEventListener()方法 ie678和欧朋老版本不支持此方法，可使用attachEvent()方法替代
function eventListener(ele, type, fn, cap) {
	var cap = cap || false;
	if (ele.addEventListener) {
		ele.addEventListener(type, fn, cap);
	} else if (ele.attachEvent) {
		ele.attachEvent('on' + type, fn);
	} else {
		ele['on' + type] = fn;
	}
}

//阻止默认行为
function preventDefault(e) {
	e.preventDefault ? e.preventDefault() : e.returnValue = false;
}
//随机颜色
function randomColor() {
	var str = '0123456789ABCDEF';
	var res = '#';
	for (var i = 0; i < 6; i++) {
		res += str.charAt(Math.round(Math.random() * 15));
	}
	return res;
}