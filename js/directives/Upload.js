define([
    'app',
    'jquery',
    'webuploader',
    'filters/byte'
], function (app, $, WebUploader) {
    'use strict';

    var deps = [ 'BaseService' ];

    function directive(BaseService) {
        return {
            scope: {
                uploadUrl: '@fcUpload',
                multiple: '@?',
                label: '@?',
                dndInfo: '@?',
                accept: '@?',
                uploaderOption: '=?',
                limitType : '=?',
            },
            templateUrl: 'views/common/upload/Upload.html',
            replace: true,
            link: function link($scope, elem) {

                $scope.files = [];
                $scope.progressStylies = {};

                $scope.uploadUrl = BaseService.restfulUrl + $scope.uploadUrl;
                var uploader = init($scope, elem);
                
                $scope.$on('$destroy', function scopeDestroy() {
                    uploader.destroy();
                });

                $scope.remove = function remove(file, index) {
                    doRemove($scope, uploader, file, index);
                };
            }
        };
    }
    
    function doRemove($scope, uploader, file, index) {
        $scope.files.splice(index, 1);
        $scope.progressStylies[file.id] = null;
        uploader.removeFile(file, true);
    }

    function init($scope, elem) {
        var btn = elem.find('.js-btn-pick');
        var dndContainer = elem.find('.js-dnd-container');
        
        var typelist = $scope.limitType?$scope.limitType:["doc","docx","xls","xlsx","ppt","pptx","pdf","mp4"];
        
        var option = getOption($scope, btn, dndContainer);
        

        var uploader = WebUploader.create(option);

        // material design 的样式设置有些古怪, 需要是`btn btn-` 开头的才会应用到一些样式, 所以这里把默认的webuploader-pick 放到后面去.
        var $realBtn = btn.find('.webuploader-pick').removeClass('webuploader-pick').addClass('btn btn-info webuploader-pick');
        setTimeout(function() {
            // 由于有个 + 号的符号在前面, 导致默认的计算宽度的处理有些偏小, 这里重新计算一下
            $realBtn.next().width($realBtn.outerWidth());
        }, 1000);

        if ($scope.dndInfo) {
            elem.find('.js-dnd-info').text($scope.dndInfo);
        } else if (option.accept && option.accept.title) {
            elem.find('.js-dnd-info').text('或将' + option.accept.title + ' 文件拖到虚线框内');
        }

        function tryRemainSingleFile() {
            if (!option.pick.multiple) {
                // 单选的, 直接把之前的文件清掉
                for (var i = $scope.files.length - 1; i >= 0; i--) {
                    doRemove($scope, uploader, $scope.files[i], i)
                }
            }
        }

        // 当有文件被添加进队列的时候
        uploader.on('fileQueued', function fileQueued(file) {
        	
        	if(typelist.indexOf(file.ext) != -1 && file.size <= 52428800)
            {
        		tryRemainSingleFile();
                
                $scope.files.push(file);
                $scope.$bus.publish({
                    channel: 'upload',
                    topic: 'fileQueued',
                    data: file
                });
                $scope.$apply();
            }else{
            	if(file.size > 52428800)
            	{
            		alert("选择的格式文件超出限定大小"); 
            	} 
            	else{
            		alert("请选择正确的格式文件");
            	}
            }
        });

        // 当有文件被移出队列的时候
        uploader.on('fileDequeued', function fileDequeued(file) {
            $scope.$bus.publish({
                channel: 'upload',
                topic: 'fileDequeued',
                data: file
            });
        });

        uploader.on('error', function error(type) {
            $scope.$bus.publish({
                channel: 'upload',
                topic: 'error',
                data: type
            });
        });

        // 文件上传过程中创建进度条实时显示。
        uploader.on('uploadProgress', function uploadProgress(file, percentage) {
            $scope.progressStylies[file.id] = $scope.progressStylies[file.id] || {};
            $scope.progressStylies[file.id].width = percentage * 100 + '%';
            $scope.$apply();
        });

        uploader.on('uploadSuccess', function uploadSuccess(file, response) {
            $scope.progressStylies[file.id].width = '100%';
            $scope.$bus.publish({
                channel: 'upload',
                topic: 'uploadSuccess',
                data: {
                    file: file,
                    response: response
                }
            });
            $scope.$apply();
        });

        uploader.on('uploadError', function uploadError(file, reason) {
            $scope.progressStylies[file.id].width = '0%';
            $scope.$bus.publish({
                channel: 'upload',
                topic: 'uploadError',
                data: {
                    file: file,
                    reason: reason
                }
            });
            $scope.$apply();
        });

        uploader.on('uploadFinished', function uploadFinished() {
            $scope.$bus.publish({
                channel: 'upload',
                topic: 'uploadFinished',
                data: {}
            });
        });

        $scope.$bus.subscribe({
            channel: 'upload',
            topic: 'start',
            callback: function startUpload() {
                uploader.upload();
            }
        });

        $scope.$bus.subscribe({
            channel: 'upload',
            topic: 'stop',
            callback: function stopUpload() {
                uploader.stop();
            }
        });

        return uploader;
    }
    
    function getOption($scope, btn, dnd) {
        var option = {
            // swf文件路径
            swf: 'bower_components/fex-webuploader/dist/Uploader.swf',

            // 文件接收服务端。
            server: $scope.uploadUrl,
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: {
                id: btn,
                multiple: $scope.multiple == null || $scope.multiple === 'true',
                innerHTML: $scope.label || '<span class="glyphicon glyphicon-plus"></span> 选择文件'
            },
            dnd: dnd,
            thumb: false,
            compress: false
        };
        if ($scope.accept) {
        	option.accept = {
                	title: 'Files',
                	extensions: 'jpg,jpeg,png,pdf',
                	mimeTypes: 'image/jpg,image/jpeg,image/png,application/pdf'
                };
        }
        
        if ($scope.accept === "Files") {
            option = $.extend({}, $scope.uploaderOption, option);
        }
        return option;
    }

    directive.$inject = deps;
    return app.lazy.directive('fcUpload', directive);
});
 