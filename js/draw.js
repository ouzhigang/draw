
//画布
var canvas;
var context;

//蒙版
var canvas_bak;
var context_bak;

var canvasWidth, canvasHeight;

var canvasTop;
var canvasLeft;

//画笔大小
var size = 1;
var color = '#000000';

var g_is_mobile = is_mobile_browser();

//画图形
var draw_graph = function(graphType, obj) {	

	//把蒙版放于画板上面
	$("#canvas_bak").css("z-index", 1);
	//先画在蒙版上 再复制到画布上
	
	chooseImg(obj);			
	var canDraw = false;	
	
	var startX;
	var startY;

	//鼠标按下获取 开始xy开始画图
	var mousedown = function(e) {

		context.strokeStyle = color;
		context_bak.strokeStyle = color;
		context_bak.lineWidth = size;
		
		var scroolTop = $(window).scrollTop();
		var scroolLeft = $(window).scrollLeft();
		canvasTop = $(canvas).offset().top - scroolTop;
		canvasLeft = $(canvas).offset().left - scroolLeft;
		
		if(g_is_mobile) {
			//手机端
			startX = e.originalEvent.targetTouches[0].clientX - canvasLeft;
			startY = e.originalEvent.targetTouches[0].clientY - canvasTop;			
		}
		else {
			//PC端
			startX = e.clientX - canvasLeft;
			startY = e.clientY - canvasTop;
		}
		//console.log("X:" + startX + ",Y:" + startY);
		//console.log(e);
		
		context_bak.moveTo(startX, startY);
		canDraw = true;			
		
		if(graphType == 'pencil') {
			context_bak.beginPath();
		}
		else if(graphType == 'circle') {
			context.beginPath();
			context.moveTo(startX, startY);
			context.lineTo(startX + 1 ,startY + 1);
			context.stroke();	
			
		}
		else if(graphType == 'rubber') {							
			context.clearRect(startX - size * 10,  startY - size * 10, size * 20, size * 20);				
		}
		
		// 阻止点击时的cursor的变化，draw
		e.originalEvent.preventDefault();
	};	

	//鼠标离开 把蒙版canvas的图片生成到canvas中
	var mouseup = function(e) {
		//e = e || window.event;
		canDraw = false;
		var image = new Image();
		if(graphType != 'rubber') {		
			image.src = canvas_bak.toDataURL();
			image.onload = function() {
				context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth, canvasHeight);
				clearContext();
				saveImageToAry();
			}
			
		}
	};

	// 鼠标移动
	var mousemove = function(e) {
		
		var scroolTop = $(window).scrollTop();
		var scroolLeft = $(window).scrollLeft();
		canvasTop = $(canvas).offset().top - scroolTop;
		canvasLeft = $(canvas).offset().left - scroolLeft;
		
		var x = 0;
		var y = 0;		
		if(g_is_mobile) {
			//手机端
			x = e.originalEvent.targetTouches[0].clientX - canvasLeft;
			y = e.originalEvent.targetTouches[0].clientY - canvasTop;
		}
		else {
			//PC端
			x = e.clientX - canvasLeft;
			y = e.clientY - canvasTop;
		}
		
		//方块  4条直线搞定
		if(graphType == 'square') {
			if(canDraw) {
				context_bak.beginPath();
				clearContext();
				context_bak.moveTo(startX, startY);						
				context_bak.lineTo(x, startY);
				context_bak.lineTo(x, y);
				context_bak.lineTo(startX, y);
				context_bak.lineTo(startX, startY);
				context_bak.stroke();
			}
			//直线
		}
		else if(graphType =='line') {						
			if(canDraw) {
				context_bak.beginPath();
				clearContext();
				context_bak.moveTo(startX, startY);
				context_bak.lineTo(x, y);
				context_bak.stroke();
			}
			//画笔
		}
		else if(graphType == 'pencil') {
			if(canDraw) {
				context_bak.lineTo(e.clientX - canvasLeft, e.clientY - canvasTop);
				context_bak.stroke();						
			}
			//圆 未画得时候 出现一个小圆
		}
		else if(graphType == 'circle') {						
			clearContext();
			if(canDraw) {
				// 鼠标点击移动时产生的圆
				context_bak.beginPath();			
				var radii = Math.sqrt((startX - x) *  (startX - x)  + (startY - y) * (startY - y));
				context_bak.arc(startX, startY, radii, 0, Math.PI * 2, false);									
				context_bak.stroke();
			}
			else {	
				context_bak.beginPath();					
				context_bak.arc(x, y, 20, 0, Math.PI *  2, false);
				context_bak.stroke();
			}
			//涂鸦 未画得时候 出现一个小圆
		}
		else if(graphType == 'handwriting') {											
			if(canDraw) {
				// 鼠标点击移动产生的圆圈
				context_bak.beginPath();	
				context_bak.strokeStyle = color;
				context_bak.fillStyle = color;
				
				//计算当前点和上一个点的距离
				var tmpX = x - startX;
				var tmpY = y - startY;
				var dist = Math.sqrt(Math.pow(tmpX, 2) + Math.pow(tmpY, 2));
				dist = Math.round(dist);
				
				//定义递增点
				var ix = tmpX / dist;
				var iy = tmpY / dist;
				
				//定义绘制点
				var currX = startX;
				var currY = startY;
				for(var i = 0; i < dist; i++) {
					context_bak.arc(currX, currY, size * 10, 0, Math.PI * 2, false);
					
					currX += ix;
					currY += iy;
				}
				
				context_bak.fill();
				context_bak.stroke();
				context_bak.restore();
				
				//保存上一次的点
				startX = x;
				startY = y;
			}
			else {	
				clearContext();
				context_bak.beginPath();		
				context_bak.strokeStyle = color;			
				context_bak.fillStyle = color;
				context_bak.arc(x, y, size * 10, 0, Math.PI * 2, false);
				context_bak.fill();
				context_bak.stroke();
			}
			//橡皮擦 不管有没有在画都出现小方块 按下鼠标 开始清空区域
		}
		else if(graphType == 'rubber') {	
			context_bak.lineWidth = 1;
			clearContext();
			context_bak.beginPath();			
			context_bak.strokeStyle = '#000000';						
			context_bak.moveTo(x - size * 10, y - size * 10);						
			context_bak.lineTo(x + size * 10, y - size * 10);
			context_bak.lineTo(x + size * 10, y + size * 10);
			context_bak.lineTo(x - size * 10, y + size * 10);
			context_bak.lineTo(x - size * 10, y - size * 10);	
			context_bak.stroke();		
			if(canDraw) {							
				context.clearRect(x - size * 10, y - size * 10, size * 20, size * 20);
			}			
		}
	};

	//鼠标离开区域以外 除了涂鸦 都清空
	var mouseout = function() {
		if(graphType != 'handwriting') {
			clearContext();
		}
	}
	
	//选择功能按钮 修改样式
	function chooseImg(obj) {
		var imgAry = $(".draw_controller li");
		for(var i = 0; i < imgAry.length; i++) {
			$(imgAry[i]).removeClass('active');
			$(imgAry[i]).addClass('normal');				
		}
		$(obj).removeClass("normal");
		$(obj).addClass("active");
	}
	
	if(g_is_mobile) {
		//手机端
		$(canvas_bak).off("touchstart touchmove touchend");
		$(canvas_bak).on('touchstart', mousedown);
		$(canvas_bak).on('touchmove', mousemove);
		$(canvas_bak).on('touchend', mouseup);
	}
	else {
		//PC端
		$(canvas_bak).off("mousedown mousemove mouseup mouseout");
		$(canvas_bak).on('mousedown', mousedown);
		$(canvas_bak).on('mousemove', mousemove);
		$(canvas_bak).on('mouseup', mouseup);
		$(canvas_bak).on('mouseout', mouseout);
	}
}

//清空层
var clearContext = function(type) {
	if(!type) {
		context_bak.clearRect(0, 0, canvasWidth, canvasHeight);
	}
	else {
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		context_bak.clearRect(0, 0, canvasWidth, canvasHeight);
	}
}
