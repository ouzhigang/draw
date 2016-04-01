
//撤销的array
var cancelList = new Array();

//撤销的次数
var cancelIndex = 0;

$(function(){
	
	canvasWidth = $(".canvas_container").width();
	canvasHeight = $(".canvas_container").height();
	
	initCanvas();
	initDrag();

	// 绑定绘画板工具
	$(".pencil").on("click", function() {
		draw_graph('pencil', this);
	});
	$(".handwriting").on("click", function() {
		draw_graph('handwriting', this);
	});
	$(".showLine").on("click", function() {
		showLineSize(this);
	});
	
	$(".rubber").on("click", function() {
		draw_graph('rubber', this);
	});
	$(".drawLine").on("click", function() {
		draw_graph('line', this);
	});
	$(".square").on("click", function() {
		draw_graph('square', this);
	});
	$(".circle").on("click", function() {
		draw_graph('circle', this);
	});
	$(".fill").on("click", function() {
		fill(this);
	});
	$(".cancel").on("click", function() {
		cancel(this);
	});
	$(".next").on("click", function() {
		next(this);
	});
	$(".clearContext").on("click", function() {
		clearContext('1');
	});
	$(".save").on("click", function() {
		save();
		$("body,html").animate({scrollTop: 550}, 200);
		$(".item:first img").css({ "box-shadow":"0 0 10px rgba(248,154,52,0.8)" });
	});
	$(".downloadImage").on("click", function() {
		downloadImage();
	});

	// 初始化铅笔工具
	$(".draw_controller li:first").click();

	// 选择线条大小
	$(".line_size button").click(function() {
		size = $(this).data("value");
		$("#line_size").hide();
	});

	// 隐藏线条宽度板
	$(".line").hover(function() {
		showLineSize($(this)[0]);
	}, function() {
		var ss = setTimeout(function() {
			$(".line_size").fadeOut(200);
		}, 100);
		$(".line_size").hover(function() {
			$(".line_size").show();
			clearTimeout(ss);
		}, function() {
			$(".line_size").fadeOut(200);
		});
	});

	//选择颜色
	$(".showColor").bigColorpicker(function(el, icolor) {
		color = icolor;
	});
	$("#f333").bigColorpicker("f3", "L", 6);	

});		
	
//初始化
var initCanvas = function() {
	canvas = document.getElementById("canvas");
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	context = canvas.getContext('2d');

	canvasTop = $(canvas).offset().top;
	canvasLeft = $(canvas).offset().left;

	canvas_bak =  document.getElementById("canvas_bak");
	canvas_bak.width = canvasWidth;
	canvas_bak.height = canvasHeight;
	context_bak = canvas_bak.getContext('2d');		
}

//下载图片
var downloadImage = function() {
	$("#downloadImage_a")[0].href = canvas.toDataURL();
}

//展开线条大小选择器
var showLineSize = function(obj) {
	if($("#line_size").is(":hidden")) {
		var top = $(obj).offset().top + 40;
		var left = $(obj).offset().left - 10;				
		$("#line_size")[0].style.left = left + "px";
		$("#line_size")[0].style.top = top + "px";
		$("#line_size").show();
	}
	else {
		$("#line_size").hide();
	}
}

//选择大小
var chooseLineSize =  function(_size){		
	size = _size;
	$("#line_size").hide();
}

// 填充前景
var fill = function() {
	context.fillStyle = color;
	context_bak.fillStyle = color;
	var $canvas = $("#canvas"),
		w = $canvas.width(),
		h = $canvas.height();
		
	context.fillRect(0, 0, w, h);

	var image = new Image();
	image.src = canvas_bak.toDataURL();
	context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth, canvasHeight);
	clearContext();
	saveImageToAry();
}

//撤销上一个操作
var cancel = function() {
	if(cancelIndex > cancelList.length - 1)
		return;
	
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	
	cancelIndex++;
	
	var index = cancelList.length - 1 - cancelIndex;
	var url = cancelList[index];
	if(url) {
		var image = new Image();
		image.src = url;
		image.onload = function() {
			context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth, canvasHeight);
		}
	}
	
}

//重做上一个操作
var next = function() {	
	if(cancelIndex <= 0)
		return;
	
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	
	cancelIndex--;
	
	var index = cancelList.length - 1 - cancelIndex;
	var url = cancelList[index];
	if(url) {
		var image = new Image();
		image.src = url;
		image.onload = function() {
			context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvasWidth, canvasHeight);
		}
	}
	
}

//保存历史 用于撤销
var saveImageToAry = function() {
	cancelIndex = 0;
	var dataUrl = canvas.toDataURL();
	cancelList.push(dataUrl);		
}		
	
// 处理文件拖入事件，防止浏览器默认事件带来的重定向  
function handleDragOver(evt) {  
	evt.stopPropagation();  
	evt.preventDefault();  
}

// 判断是否图片  
function isImage(type) {  
	switch (type) {  
	case 'image/jpeg':  
	case 'image/png':  
	case 'image/gif':  
	case 'image/bmp':  
	case 'image/jpg':  
		return true;  
	default:  
		return false;  
	}  
}

// 处理拖放文件列表  
function handleFileSelect(evt) {  
	evt.stopPropagation();  
	evt.preventDefault();  

	var files = evt.dataTransfer.files;  

	for (var i = 0, f; f = files[i]; i++) {    
		var t = f.type ? f.type : 'n/a';
		reader = new FileReader();
		isImg = isImage(t);
		  
		// 处理得到的图片  
		if (isImg) {  
			reader.onload = (function (theFile) {  
				return function (e) {  
					var image = new Image(); 
					image.src = e.target.result ;
					
					var hRatio;
					var wRatio;
					var l = 0;
					var t = 0;
					var maxWidth = 960;
					var maxHeight = 580;
					var Ratio = 1;
					var w = image.width;
					var h = image.height;
					wRatio = maxWidth / w;
					hRatio = maxHeight / h;
					// 图像大小超出绘画板大小，计算出缩放比例
					if (wRatio < 1 || hRatio < 1) {
						Ratio = (wRatio <= hRatio ? wRatio : hRatio);
					}
					// 根据比例重新设置图像大小
					if (Ratio < 1) {
						w = w * Ratio;
						h = h * Ratio;						
					}
					// 图片居中摆放
					l = (maxWidth - w) / 2;
					t = (maxHeight - h) / 2;

					image.onload = function() {
						// 居中缩放
						context.drawImage(image, 0, 0, image.width, image.height, l, t, w, h);
					}

				};  
			})(f)  
			reader.readAsDataURL(f);  
		}   
	}    
}  

//初始化拖入效果
var initDrag = function() {
	var dragDiv = document.getElementById("canvas_bak");
	dragDiv.addEventListener('dragover', handleDragOver, false);  
	dragDiv.addEventListener('drop', handleFileSelect, false);  
}
