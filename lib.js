
(function (global, factory) {
    "document" in global ? global.MusicVisualization = factory() : console.log("致命错误");
})(this, function () {
	class MusicVisualization {
	
		constructor() {
			this.audio = null;
			this.audioCtx = null;
			this.animate = null;
			this.analyser = null;
			this.dataArray = null;
			this.canvasCtx = null;
			this.animate = null;
			this.songsList = [
				"./music/black.mp3",
				"./music/Ibuki.mp3",
				"./music/Mad-Machine.mp3",
				"./music/Tiger-Blood.mp3",
				"./music/菅野祐悟 - ブラフをかけろ.mp3"
			]
			this.init();
		}
	
		init() {
			//新的动画接口不熟悉......
			window.app = this;
			//创建画布
			this.createCanvasCtx();
			//创建歌曲列表
			this.createSongsList();
			//播放
			this.play(0);
		}
		//创建音频元素和语境
		createAudioCtx(songId) {
			this.audio && this.audio.pause();
			let audio = new Audio();
			audio.preload = "auto";
			audio.src = this.songsList[songId];
			this.audio = audio;
			//创建语境
			this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
		}
		createAnalyser() {
			//创建分析器
			this.analyser = this.audioCtx.createAnalyser();
			//从audio元素创建音频数据
			let source = this.audioCtx.createMediaElementSource(this.audio);
			//将音频数据连接到分析器
			source.connect(this.analyser);
			//连接到播放设备
			this.analyser.connect(this.audioCtx.destination);
			//???????
			this.analyser.fftSize = 4096;
			//频谱数据平滑度
			this.analyser.smoothingTimeConstant = 0.9;
		}
		// 创建画布
		createCanvasCtx() {
			let canvas = createEle("canvas", "您的浏览器不支持canvas");
	
			canvas.width = document.documentElement.clientWidth;
			canvas.height = document.documentElement.clientHeight;
			//在页面中插入元素
			document.body.appendChild(canvas);
			this.canvasCtx = canvas.getContext("2d");
		}
		//创建歌曲列表
		createSongsList() {
			let songsListWrap = createEle("div", "", {
				id: "songsListWrap"
			});
			songsListWrap.style.marginTop = "-" + this.canvasCtx.canvas.height / 2 + "px";
			let songItem = null;
			for (let i = 0; i < this.songsList.length; i++) {
				songItem = createEle("a", this.songsList[i].substring(8), {
					href: "javascript:void(0)"
				});
				//绑定事件
				eventListener(songItem, "click", (e) => {
					//点歌曲播放,i为歌曲ID
					this.play(i);
				})
				//插入元素
				songsListWrap.appendChild(songItem)
			}
			//将列表元素插入页面
			document.body.appendChild(songsListWrap);
		}
		//创建存放分析数据的数组
		createDataArray(length) {
			//创建保存数据的数组
			this.dataArray = new Uint8Array(this.analyser.fftSize);
		}
		//播放
		play(songId) {
			//创建音频环境
			this.createAudioCtx(songId);
			//创建分析器
			this.createAnalyser()
			//创建数据容器(一个大数组)
			this.createDataArray();
			//播放
			this.audio.play();
			//调用效果动画
			this.loop();
		}
		//获取频谱分析数据
		getAnalyserData() {
			//从分析器获取频谱分析数据
			this.analyser.getByteFrequencyData(this.dataArray);
			//返回数据
			return this.dataArray;
		}
		//效果绘制
		star(ctx, x, y, r, count, data) {
			let cas = ctx;
			cas.save();
			cas.translate(x, y);
			cas.beginPath();
			cas.moveTo(0, r + data[0]);
			for (var i = 0; i < count; i++) {
				cas.lineTo(Math.sin((360 / count) * i * (Math.PI / 180)) * (r + data[i]), Math.cos((360 / count) * i * (Math.PI /
					180)) * (r + data[i]));
				cas.lineTo(Math.sin((360 / count) * (i + 0.5) * (Math.PI / 180)) * r, Math.cos((360 / count) * (i + 0.5) * (Math
					.PI / 180)) * r);
			}
			cas.closePath();
			cas.restore();
		}
		loop() {
			//获取数据
			let data = window.app.getAnalyserData();
			// canvasCtx.strokeStyle = randomColor();
			window.app.canvasCtx.clearRect(0, 0, window.app.canvasCtx.canvas.width, window.app.canvasCtx.canvas.height);
			window.app.star(window.app.canvasCtx, window.app.canvasCtx.canvas.width / 2, window.app.canvasCtx.canvas.height / 2,
				100, 512, data);
			window.app.canvasCtx.stroke();
			window.app.animate = requestAnimationFrame(window.app.loop);
		}
	}
	return MusicVisualization
});







