/**
 * 消息列表
 */
define(["app",
        "bootstrapJs", 
        "services/BaseService", 
        "services/TipsService",
        'directives/ImageCrop',
        'directives/alicebot/LearnSearchPicker',
        'directives/Upload'
],function (app) {

    var deps = ["$scope", "$state", "$stateParams", "AlicebotResource", "TipsService"];

    function controller($scope, $state, $stateParams, AlicebotResource, TipsService) {
    	
    	$scope.selectMenuId = $stateParams.selectMenuId;
    	$scope.docList = [];
        var files = {};
        $scope.attachLength = 0;

        $scope.uploaderOption = {
            fileSingleSizeLimit: 50 * 1024 * 1024
        };
        
        $scope.typelist = ["doc","docx","xls","xlsx","ppt","pptx","pdf"];
        
        function saveAttachs() {
            $scope.$bus.publish({
                channel: 'upload',
                topic: 'start',
                data: null
            });
        }

        $scope.$bus.subscribe({
            channel: 'upload',
            topic: 'fileQueued',
            callback: function fileQueued(file) {
                files[file.id] = file;

                $scope.attachLength++;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        $scope.$bus.subscribe({
            channel: 'upload',
            topic: 'fileDequeued',
            callback: function fileDequeued(file) {
                delete files[file.id];

                $scope.attachLength--;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        $scope.$bus.subscribe({
            channel: 'upload',
            topic: 'error',
            callback: function error(type) {
                if (type === 'F_EXCEED_SIZE') {
                    TipsService.show('请选择50M以下的文件!');
                }
            }
        });
        
        $scope.$bus.subscribe({
            channel: 'upload',
            topic: 'uploadError',
            callback: function uploadError(file, reason) {
            	var fileName = file.name;
                TipsService.show(fileName+'上传失败!');
            }
        });

        $scope.$bus.subscribe({
            channel: 'upload',
            topic: 'uploadSuccess',
            callback: function uploadSuccess(data) {
            	if(data.response._raw !=undefined){
            		files[data.file.id].attachId = data.response._raw;
            	}
            }
        });

        $scope.$bus.subscribe({
            channel: 'upload',
            topic: 'uploadFinished',
            callback: function uploadFinished() {
            	_.forOwn(files, function eachFile(value) {
            		
            		if(value.attachId !=undefined){
            			$scope.docList.push(value.attachId);
	            		AlicebotResource.docsUpdate($scope.selectMenuId,value.attachId).success(function(data){
							 if(!data){
								 TipsService.show(value.name+"上传失败");
							 }
							 if(_.size(files) == $scope.docList.length){
			            			$scope.cancel();
			            	 }
				        });
            		}
                });
            }
        });

        /**
         * 删除附件资料
         */
        $scope.removeAttach = function removeAttach(file) {
            _.remove($scope.message.attachments, function removeCond(vo) {
                return vo.attachId === file.attachId;
            });
            _.remove($scope.message.attachments, function removeCond(attachId) {
                return attachId === file.attachId;
            });
        };
        
        $scope.save = function(){
        	saveAttachs();
        }
        $scope.cancel= function(){
        	$state.go('home.docmanagement');
        }


    }
    
    controller.$inject = deps;
	return app.lazy.controller("DocUploadController", controller);
});
