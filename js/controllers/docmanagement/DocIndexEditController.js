/**
 * 消息列表
 */
define(["app",
        "bootstrapJs", 
        "services/BaseService", 
        "services/TipsService",
        'directives/ImageCrop',
        'directives/alicebot/LearnSearchPicker',
        'directives/Upload',
        "controllers/common/TipTextController"
],function (app) {

    var deps = ["$scope","$modalInstance","$modal", "addlevel","weatherCreate","editItem","docIndex_All", "AlicebotResource", "TipsService"];

    function controller($scope,$modalInstance,$modal,addlevel,weatherCreate,editItem,docIndex_All, AlicebotResource, TipsService) {
    	
    	$scope.title = addlevel == 1?"一":"二";
    	$scope.addlevel = addlevel;
    	$scope.weatherCreate = weatherCreate;
    	$scope.initMenueMsg = editItem?editItem:[];				//修改的条目信息
    	
    	$scope.menueName = $scope.initMenueMsg.menueName?$scope.initMenueMsg.menueName:"";	//条目名称
    	$scope.pmenueId = $scope.initMenueMsg.pmenueId?$scope.initMenueMsg.pmenueId:"";		//上级条目ID
    	
    	$scope.menueNameMax = 15;
    	
    	$scope.docIndex_List = [];
    	
    	$scope.menueNameSInit = [{"menueName":""}];			//二级文档新增时初始化数据
    	$scope.menueNameS = [];					//保存数据库的条目名称列表
    	
    	$scope.allSetNameOne = [];
    	$scope.allSetNameTwo = [];
    	$scope.nameSetting = false;
    	
    	//循环获取已设置的 menu 列表
    	for(var i = 0;i<docIndex_All.length;i++){
			var menueName = docIndex_All[i].menueName?docIndex_All[i].menueName:"";
			if(menueName)$scope.allSetNameOne.push(docIndex_All[i].menueName);
			if(docIndex_All[i].childMenues){
				for(var n = 0;n<docIndex_All[i].childMenues.length;n++){
					if(!$scope.allSetNameTwo[docIndex_All[i].menueId]) $scope.allSetNameTwo[docIndex_All[i].menueId] = [];
					$scope.allSetNameTwo[docIndex_All[i].menueId].push(docIndex_All[i].childMenues[n].menueName);
        		}
			}
		}
    
    	
    	function queryDocMenue(){				//获取列表信息	
    		if($scope.addlevel != 1){
    			AlicebotResource.queryDocMenue(false).success(function(data){
    				//只能新增到没有存在文档的一级分类下
        			$scope.docIndex_List = data;
                });
    		}	
    	}
    	queryDocMenue();
    	
    	$scope.changepMenue = function(pmenueId){
    		$scope.pmenueId = pmenueId;
    	};
    	function showTip(tipWork,callback){
			var TipText = tipWork;
			var TipBtnShow = false;
			var templateUrl = 'views/common/tiptext.html';
			var modalInstance = $modal.open({
				templateUrl: templateUrl,
				controller: "TipTextController",
				   resolve: {
				    	TipText: function () {
				    		return TipText;
					    }, 
					    TipBtnShow: function () {
				    		return TipBtnShow;
					    }, 
				    },
				    windowClass : "show smalltip"
			});
				
	 		modalInstance.result.then(function(resp) {
	 			callback;
			},function() {
					
			});
		}
    	
    	//添加二级条目
    	$scope.addEditItem = function(){
    		$scope.menueNameSInit.push({"menueName":""});
    	};
    	$scope.locaNum = 0;
    	window.checkName = function(target){
    		$scope.locaNum = document.getElementById(target.id).getAttribute("data-num");
    		var weatherSetting = false;
    		for(var listLength = 0;listLength < $scope.menueNameSInit.length - 1;listLength++){
    			if($scope.menueNameSInit[listLength].menueName == target.value && listLength != $scope.locaNum){
    				weatherSetting = true;
    			}
    		}
    		
    		$scope.nameSetting = weatherSetting;
    	};
    	
    	//删除对应二级条目
    	$scope.delEditItem = function(index){
    		$scope.menueNameSInit.splice(index,1);
    	};
    	
    	$scope.save = function(){
    		
    		// 新增一级文档
    		if($scope.addlevel == 1 && $scope.weatherCreate){
    			//判断新增名称是否重名
    			if($scope.allSetNameOne.indexOf($scope.menueName) != -1){
    				showTip('该分类名已存在，请重新设置',function(){});
    				document.getElementById('menueName').focus();
    				return false;
    			}
    			if($scope.menueName.length == 0){
    				document.getElementById('menueName').focus();
    				return false;
    			}
    			$scope.menueNameS.push($scope.menueName);
        		AlicebotResource.addDocMenue(addlevel,$scope.menueNameS,$scope.pmenueId).success(function(data){
        			$scope.close();
                });
    		}
    		//修改文档分类
    		if(!$scope.weatherCreate){
    			
    			if($scope.pmenueId == "" && $scope.allSetNameOne.indexOf($scope.menueName) != -1){
    				showTip('该分类名已存在，请重新设置',function(){});
    				document.getElementById('menueName').focus();
    				return false;
    			}else{
    				if($scope.pmenueId != "" &&$scope.allSetNameTwo[$scope.pmenueId].indexOf($scope.menueName) != -1){
    					showTip('该分类名已存在，请重新设置',function(){});
        				document.getElementById('menueName').focus();
        				return false;
    				}
    			}
    			if($scope.menueName.length == 0){
    				document.getElementById('menueName').focus();
    				return false;
    			}
    			
        		AlicebotResource.updateDocMenue($scope.initMenueMsg.menueId,$scope.menueName).success(function(data){
        			$scope.close();
                });
    		}
    		//新增二级文档
    		if($scope.addlevel == 2 && $scope.weatherCreate){
    			var allGetMsg = true;
    			$scope.menueNameS = [];
    				for(var listLength = 0;listLength < $scope.menueNameSInit.length;listLength++){
        				var target = listLength + 1;
        				//判断是否存在空输入
        				if($scope.menueNameSInit[listLength].menueName.length == 0){
        					document.getElementById('menueName'+ target).focus();
        					allGetMsg = false;
        					break;
        				}else{
        					//判断新增名称是否跟已设置的重名
        	    			if($scope.allSetNameTwo[$scope.pmenueId] && $scope.allSetNameTwo[$scope.pmenueId].indexOf($scope.menueNameSInit[listLength].menueName) != -1){
        	    				showTip('该分类名已存在，请重新设置',function(){});
        	    				document.getElementById('menueName'+ target).focus();
        	    				allGetMsg = false;
            					break;
        	    			}else{
        	    				//判断新增名称是否重名
            	    			var weatherSettingSave = false;
            	        		for(var listLengthSave = 0;listLengthSave < $scope.menueNameSInit.length - 1;listLengthSave++){
            	        			if($scope.menueNameSInit[listLengthSave].menueName == $scope.menueNameSInit[listLength].menueName && listLengthSave != listLength){
            	        				weatherSettingSave = true;
            	        			}
            	        		}
            	        		if(weatherSettingSave){
            	        			showTip('该分类名存在重名，请重新设置',function(){});
            	        			document.getElementById('menueName'+ target).focus();
            	    				allGetMsg = false;
            	    				break;
            	        		}else{
            	        			$scope.menueNameS.push($scope.menueNameSInit[listLength].menueName);
            	        		}
        	    			}
        				}
        			}
    			
    			if(!$scope.pmenueId){document.getElementById('pmenueId').focus();return false;}
    			if(!allGetMsg)return false;
    			
    			AlicebotResource.addDocMenue(addlevel,$scope.menueNameS,$scope.pmenueId).success(function(data){
        			$scope.close();
                });
    		}
    	};
    	
    	
    	$scope.cancel = function() {
			$modalInstance.dismiss('no');
		};
				
		$scope.close = function(){
			$modalInstance.dismiss('no');
		};
    	
   }
    
    controller.$inject = deps;
	return app.lazy.controller("DocIndexEditController", controller);
});