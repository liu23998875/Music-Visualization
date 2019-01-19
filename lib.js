(function (global, factory) {
    "document" in global ? global.MusicVisualization = factory() : console.log("致命错误");
})(this, function () {
	class MusicVisualization {
		/*
		options
		{
			songsListWrap:歌曲列表元素id,
			canvas:{//画布设定
				width:宽度,//默认最大窗口宽度
				height:高度,//默认最大窗口高度
				linewidth:线宽,//默认1
				color:颜色//,默认黑色
			},
			visual:{//可视效果设定
				fftSize:声音样本的窗口大小//fftSize 属性的值必须是从32到32768范围内的2的非零幂; 其默认值为2048.
				smoothing:数据平滑度//0-1 默认0.8
				count:实际显示的数量//默认等于fftSize的一半，但不是必须为fftsize的一半
				length:音频效果长度//为0-1之间的值，默认等于1，等于0就不动了
			}
		}
		*/
		constructor(options) {
			this.audio = null;
			this.audioCtx = null;
			this.animate = null;
			this.analyser = null;
			this.dataArray = null;
			this.canvasCtx = null;
			this.animate = null;
			this.options = options;
      this.playProgress = null;
      this.loadProgress = null;
      this.playProgressTimer = null;
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
			window.mvapp = this;
			//创建画布
			this.createCanvasCtx();
			//创建歌曲列表
			this.createSongsList();
      this.getLoadProgress();
      this.getPlayProgress();
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
      //绑定事件
      //开始加载
      eventListener(audio,"loadstart",function(){
        console.log("开始加载");
      });
      //
      eventListener(audio,"canplay",()=>{
        console.log("音频就绪");
        //在音频加载过程之中不断触发
        eventListener(audio,"progress",()=>{
          this.loadedProgress();
        });
      });
      
      //加载结束
      eventListener(audio,"loadend",function(){
        console.log("加载完毕");
      });
      //开始播放 无论是初次，暂停还是重新开始
      eventListener(audio,"playing",()=>{
        console.log("开始播放");
        //调用播放进度定时器
        //避免生成多个定时器
        window.clearInterval(this.playProgressTimer);
        console.log(this.playProgressTimer);
        this.playProgressTimer = window.setInterval(()=>{
          this.playedProgress();
        },1000);
      });
      
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
			this.analyser.fftSize = this.options.visual.fftSize||2048;
			//频谱数据平滑度
			this.analyser.smoothingTimeConstant = this.options.visual.smoothing||0.8;
		}
		// 创建画布
		createCanvasCtx() {
			let canvas = createEle("canvas", "您的浏览器不支持canvas");
	
			canvas.width = this.options.canvas.width||document.documentElement.clientWidth;
			canvas.height = this.options.canvas.height||document.documentElement.clientHeight;
			this.canvasCtx = canvas.getContext("2d");
			//设置画布
			this.canvasCtx.lineWidth = this.options.canvas.lineWidth;
			this.canvasCtx.strokeStyle = this.options.canvas.color||"black";
			//在页面中插入元素
			document.body.appendChild(canvas);
		}
		//创建歌曲列表
		createSongsList() {
			let songsListWrap = document.getElementById("songsListWrap");
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
		}
    //获取播放进度元素
    getPlayProgress(){
      this.playProgress = this.options.playProgress&&document.getElementById(this.options.playProgress);
    }
    //获取加载进度元素
    getLoadProgress(){
      this.loadProgress = this.options.loadProgress&&document.getElementById(this.options.loadProgress);

    }
		//创建存放分析数据的数组
		createDataArray() {
			//创建保存数据的数组
			this.dataArray = new Uint8Array(this.analyser.fftSize);
		}
    //获取频谱分析数据
		getAnalyserData() {
			//从分析器获取频谱分析数据
			this.analyser.getByteFrequencyData(this.dataArray);
			//返回数据
			return this.dataArray;
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
		//暂停
		pause(){
				
		}
		// 继续播放
		continuation(){
      
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
    //加载进度
    loadedProgress(){
      //开始加载
      let allTime = this.audio.duration;
      let loadedTime = this.audio.buffered.end(0);
      let percent = loadedTime/allTime*100;
      this.loadProgress.value = percent;
    }
    //播放进度
    playedProgress(){
      let allTime = this.audio.duration;
      let playedTime = this.audio.currentTime;
      let percent = playedTime/allTime*100;
      this.playProgress.value = percent;
    }
		frame(){
			let data = this.getAnalyserData();
			let count = this.options.visual.count||this.analyser.fftSize/2;
			// canvasCtx.strokeStyle = randomColor();
			this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);
			this.star(this.canvasCtx, this.canvasCtx.canvas.width / 2, this.canvasCtx.canvas.height / 2,
				100, count, data);
			this.canvasCtx.stroke();
		}
    
		loop() {
			//获取数据
			let _this = window.mvapp
			_this.frame();
			_this.animate = requestAnimationFrame(_this.loop);
		}
	}
	return MusicVisualization
});







