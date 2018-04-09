require.config({
	paths : {
		"jquery" : "lib/jquery-1.10.2.min",
		"angular" : "lib/angular/angular.min",
		"angularResource" : "lib/angular/angular-resource",
		"uiRoute" : "lib/ui-router/angular-ui-router.min",
		"angularSanitize" : "lib/angular/angular-sanitize.min",
		"angularCookies" : "lib/angular/angular-cookies",
		"angularLocale" : "lib/angular/i18n/angular-locale_zh-cn",
		"bootstrapUI" : "lib/angular/angularUI/ng-bootstrap/ui-bootstrap-tpls-0.12.1.min",
		"bootstrapJs" : "lib/bootstrap.min",
		"datetimepicker" : "lib/datetimepicker/js/bootstrap-datetimepicker.min",
		"datetimepickerCn" : "lib/datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN",
		"jquery.zclip" : "lib/zclip/jquery.zclip.min",
		"jqueryUI" : "lib/jqueryui/jquery-ui-1.10.3.custom.min",
		"jqueryUITouchPunch" : "lib/jquery-ui-touch-punch/jquery.ui.touch-punch.min",
		"uislider" : "lib/uislider/slider",
		"dragscrollable" : "lib/dragscrollable/dragscrollable.min",
		"moment" : "lib/moment/moment",
		"websocket" : "lib/websocket",
		"md5" : "lib/md5/md5",
		"des" : "lib/crypto/tripledes",
		"crypto": "lib/crypto/core",
		"ecb" : "lib/crypto/mode-ecb",
		"lodash" : "lib/lodash/lodash.min",
		"postal" : "lib/postal/postal.min",
		"jcrop" : "lib/jcrop/jquery.Jcrop.min",
		"ngTable" : "lib/table/ng-table",
		"ueditor" : "lib/ueditor/ueditor.all",
		"ueditor.config" : "lib/ueditor/ueditor.config",
		"angularUEditor": "lib/angular-ueditor/angular-ueditor.min",
        "spin": "lib/spin.js/spin.min",
        "caret" : "lib/caret/jquery.caret",
        "pdfobject" : "lib/pdfobject/pdfobject",
		"webuploader": "lib/webuploader/webuploader.html5only",
		"IndexedDBShim": "lib/IndexedDBShim/IndexedDBShim",
		"jqueryIndexeddb": "lib/jquery-indexeddb/jquery.indexeddb",
        "uiSortable":"lib/ui-sortable/sortable",
        "xeditable":"lib/xeditable/xeditable",
        "qrcode" : "lib/jquery-qrcode/jquery.qrcode.min"
	},
	shim : {
		"angular" : {
			"deps" : ["jquery"],
			"exports" : "angular"
		},
		"angularLocale" : ["angular"],
		"uiRoute" : ["angular"],
		"angularResource" : ["angular"],
		"angularSanitize" : ["angular"],
		"angularCookies" : ["angular"],
		"bootstrapUI" : ["angular"],
		"bootstrapJs" : ["jquery"],
		"datetimepicker": ["jquery"],
		"datetimepickerCn": ["datetimepicker"],
		"jqueryUI": ["jquery"],
		"jqueryUITouchPunch": ["jqueryUI"],
		"uislider": ["angular", "jqueryUI", "jqueryUITouchPunch"],
		"moment": {"exports" : "moment"},
		'websocket': {'exports' : 'YGWebSocket'},
		'ecb':['des'],
		'jcrop': ['jquery'],
		'ngTable' : ["angular"],
		'ueditor': ['ueditor.config'],
		'angularUEditor': ["ueditor"],
		'webuploader': ['jquery'],
		'jqueryIndexeddb': ['jquery', 'IndexedDBShim'],
        'uiSortable':["angular","jqueryUI"],
        'dragscrollable': ['jquery'], 
		'xeditable' : ['angular']
	},
	priority: [
		"jquery",
		"angular"
	]
});

require(["app"], function (app) {
	$(document).ready(function() {
		angular.bootstrap(document, [app.name]);
	});
});