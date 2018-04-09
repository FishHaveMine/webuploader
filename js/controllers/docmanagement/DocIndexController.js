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
        "controllers/common/TipTextController",
        "controllers/docmanagement/DocIndexEditController",
        "controllers/docmanagement/DocUploadController",
],function (app) {

    var deps = ["$scope","$rootScope","$modal", "$state", "$stateParams", "AlicebotResource", "TipsService"];

    function controller($scope,$rootScope,$modal, $state, $stateParams, AlicebotResource, TipsService) {
    	
    	$scope.docIndex_List = []; 				//分级列表对象
    	if($rootScope.docShowItem){
    		$scope.showItemId =  $rootScope.docShowItem.menueId || "";
        	$scope.showItemPmenueId =  $rootScope.docShowItem.pmenueId || "";
    	}else{
    		$scope.showItemId =  "";
        	$scope.showItemPmenueId = "";
    	}
    	$scope.tiggerShow = false;
    	
    	$scope.docItemList = [];
    	
    	$scope.currentPage = $rootScope.docIndexCurrentPage || 1;
    	$scope.pageSize = 10;
   		$scope.pageSizeList = [10,20,50,100,200];

    	function queryDocMenue(){				//获取列表信息	
    		AlicebotResource.queryDocMenue(true).success(function(data){
    			for(var Length = 0;Length < data.length;Length++){	//循环一次添加是否有下级
    				if(data[Length].childMenues){
    					data[Length].haveChild = true;
    				}else{
    					data[Length].haveChild = false;
    				}
    			}
    			$scope.docIndex_List = data;

    			if($scope.showItemId == "" && $scope.docIndex_List) 
    			{
    				$scope.setShowItemId($scope.docIndex_List[0],1);
    			}else{
    				if($scope.showItemPmenueId == ""){
    					//选取一级新增二级
        				for(var Length = 0;Length < data.length;Length++){	//循环一次添加是否有下级
            				if(data[Length].menueId == $scope.showItemId){
            					$scope.setShowItemId(data[Length],1);
            					break;
            				}
            			}
    				}else{
    					//本身已选择了一个二级分类
    					queryDocFileList();
    				}
    				
    			}
            });
    	}
    	
	    function queryDocFileList(){
	    	AlicebotResource.queryDocFileList($scope.showItemId,$scope.currentPage,$scope.pageSize).success(function(data){
	    		$scope.docItemList = data.docItemList;
	    		generatePagesArray($scope, data.total);
            });
	    }
    	queryDocMenue();
    	
    	function showTip(tipWork,callback){
			var TipText = tipWork;
			var TipBtnShow = true;
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
	 			callback(resp);
			},function() {
					
			});
		}
    	$scope.setShowItemId = function(ID,form){
    		//tiggerShow 是否展开 	true：展开 	false：不展开
    		//展开场景： 1.第一次选取有二级的一级栏目		2.点击二级栏目
    		if(ID.childMenues && $scope.showItemPmenueId != ID.childMenues[0].pmenueId){
    			$scope.tiggerShow = true;
    		}
    		if(ID.childMenues && $scope.showItemPmenueId == ID.childMenues[0].pmenueId){
    			$scope.tiggerShow = $scope.tiggerShow?false:true;
    		}
    		if(ID.childMenues && ID.pmenueId != '' && ID.pmenueId == $scope.showItemPmenueId){
    			$scope.tiggerShow = true;
    		}
    		if(form == 1){
    			$scope.tiggerShow = true;
    		}
    		if(ID.pmenueId != ''){
    			$scope.showItemId = ID.menueId;
    		}else{
    			$scope.showItemId = $scope.showItemId == ID.menueId?"":ID.menueId;
    		}
    		$scope.showItemPmenueId = ID.pmenueId?ID.pmenueId:"";
    		$rootScope.docShowItem = ID;
    		if(ID.childMenues){
    			$scope.showItemId = ID.childMenues[0].menueId;
    			$scope.showItemPmenueId = ID.childMenues[0].pmenueId;
    			$rootScope.docShowItem = ID.childMenues[0];	
    		}
    		
    		queryDocFileList();
    	}
    	
    	$scope.deleteMenuTtem= function(item){
    		showTip("确定删除文档分类："+item.menueName+"?",function(resp){
    			if(resp == "ok")
    			{ 
    				AlicebotResource.delDocMenue(item.menueId).success(function(data){
					 if(data){
						 TipsService.show("删除成功");
					 }else{
						 TipsService.show("删除失败");
					 }
					 $scope.showItemId =  "";
			         $scope.showItemPmenueId = "";
					 queryDocMenue();
    				});
    			}
    		}
    		);
    	}
    	$scope.addFileItem = function(){	//上传文档
    		var selectMenu = $scope.showItemId
    		$state.go('home.docUpload',{'selectMenuId':selectMenu});
    	};
    	$scope.addDocMenu = function(level){
    		var addlevel = level
    		var templateUrl = 'views/docmanagement/DocIndexEdit.html';
    		var modalInstance = $modal.open({
				templateUrl: templateUrl,
				controller: "DocIndexEditController",
			    resolve: {
			    	addlevel: function () {
			    		return addlevel;
				    },
				    weatherCreate : function () {
			    		return true;
				    },
				    editItem : function () {
			    		return [];
				    },
				    docIndex_All : function () {
			    		return $scope.docIndex_List;
				    },
			    },
			    windowClass : "show"
			});
			// 回调,刷新list画面 —— 缓存操作 不进行持久化保存
 			modalInstance.result.then(function(resp) {
 				queryDocMenue();
			},function() {
				queryDocMenue();
			});
    	}
    	$scope.editMenuTtem = function(item){
    		var editaddlevel = item.level;
    		var editItem = item;
    		var templateUrl = 'views/docmanagement/DocIndexEdit.html';
    		var modalInstance = $modal.open({
				templateUrl: templateUrl,
				controller: "DocIndexEditController",
			    resolve: {
			    	addlevel: function () {
			    		return editaddlevel;
				    },
				    weatherCreate : function () {
			    		return false;
				    },
				    editItem : function () {
			    		return editItem;
				    },
				    docIndex_All : function () {
			    		return $scope.docIndex_List;
				    },
			    },
			    windowClass : "show"
			});
			// 回调,刷新list画面 —— 缓存操作 不进行持久化保存
 			modalInstance.result.then(function(resp) {
 				queryDocMenue();
			},function() {
				queryDocMenue();
			});
    	}
   
    	
    	$scope.deleteDocItem = function(docItem){
    		showTip("确定删除文档：<"+docItem.fileName+">?",function(resp){
    			if(resp == "ok")
    			{ 
    				 AlicebotResource.deleteDocFile(docItem.docId,docItem.internalFileName).success(function(data){
 		    			queryDocFileList();
 		            });
    			}
    		}
    		);	
    	}
    	 /**
         * 点击某一页
         * @param page
         */
        $scope.gotoPage = function(page){
            $scope.currentPage = page;
            $rootScope.docIndexCurrentPage = $scope.currentPage;
           queryDocFileList();
        };

        $scope.nextPage = function(){
            $scope.currentPage++;
            $rootScope.docIndexCurrentPage = $scope.currentPage;
            queryDocFileList();
        };

        $scope.upPage = function(){
            $scope.currentPage--;
            $rootScope.docIndexCurrentPage = $scope.currentPage;
           queryDocFileList();
        };
        $scope.setpageSize = function(){
        	$scope.currentPage = 1;
        	$rootScope.docIndexCurrentPage = $scope.currentPage;
       	 	queryDocFileList();
        }
    }
    /**
     * 分页计算设置
     */
    function generatePagesArray($scope, totalItems) {
        var maxBlocks, maxPage, maxPivotPages, minPage, numPages;
        maxBlocks = 11;
        $scope.pages = [];
        numPages = Math.ceil(totalItems / $scope.pageSize);
        if (numPages > 1) {
        	if($scope.currentPage != 1){
        		$scope.pages.push({
                    type: 'prev',
                    currentNum : $scope.currentPage,
                    number: Math.max(1, $scope.currentPage - 1),
                    active: $scope.currentPage > 1
                });
        	}
        	$scope.pages.push({
                type: 'first',
                currentNum : $scope.currentPage,
                number: 1,
                active: $scope.currentPage > 1
            });
            maxPivotPages = Math.round((maxBlocks - 5) / 2);
            minPage = Math.max(2, $scope.currentPage - maxPivotPages);
            maxPage = Math.min(numPages - 1, $scope.currentPage + maxPivotPages * 2 - ($scope.currentPage - minPage));
            minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
            var i = minPage;
            while (i <= maxPage) {
                if ((i === minPage && i !== 2) || (i === maxPage && i !== numPages - 1)) {
                	$scope.pages.push({
                        type: 'more',
                        active: false
                    });
                } else {
                	$scope.pages.push({
                        type: 'page',
                        number: i,
                        currentNum : $scope.currentPage,
                        active: $scope.currentPage !== i
                    });
                }
                i++;
            }
            $scope.pages.push({
                type: 'last',
                number: numPages,
                currentNum : $scope.currentPage,
                active: $scope.currentPage !== numPages
            });
            if($scope.currentPage < numPages){
            	$scope.pages.push({
                    type: 'next',
                    currentNum : $scope.currentPage,
                    number: Math.min(numPages, $scope.currentPage + 1),
                    active: $scope.currentPage < numPages
                });
            }
        }
    }

    controller.$inject = deps;
	return app.lazy.controller("DocIndexController", controller);
});