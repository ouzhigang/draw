
//判断浏览器是不是手机端
function is_mobile_browser(){
	var browser = {
        versions: function() {
            var u = navigator.userAgent,
            app = navigator.appVersion;
            return {
                mobile: !!u.match(/AppleWebKit.*Mobile.*/),
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                android: u.indexOf("Android") > -1 || u.indexOf("Linux") > -1,
                iPhone: u.indexOf("iPhone") > -1,
                iPad: u.indexOf("iPad") > -1
            };
        } (),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    };
	
	if( browser.versions.android || browser.versions.iPhone || browser.versions.iPad)
		return true;	
	else
		return false;
}
