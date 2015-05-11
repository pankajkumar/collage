/* magic.js */
var canvas = new fabric.Canvas('canvas');
//canvas.renderOnAddRemove = false;
canvas.stateful = false;
canvas.selection = false;
angular.module('collage', []).
    controller('CollageController', ['$scope', '$http', function ($scope, $http) {
        $scope.canvasList={};
        $scope.name="";
        //function to generate thumb
        function getThumbnail(original) {
            var dimensions=resize(900,500,200,200);
            var thumbnail = document.getElementById("thumbnail");
            thumbnail.width = dimensions.w;
            thumbnail.height = dimensions.h;
            thumbnail.getContext("2d").drawImage(original, dimensions.x, dimensions.y, thumbnail.width, thumbnail.height);
            return thumbnail;
        }
        function resize( imagewidth, imageheight, thumbwidth, thumbheight ) {
            var w = 0, h = 0, x = 0, y = 0,
                widthratio  = imagewidth / thumbwidth,
                heightratio = imageheight / thumbheight,
                maxratio    = Math.max( widthratio, heightratio );
            if ( maxratio > 1 ) {
                w = imagewidth / maxratio;
                h = imageheight / maxratio;
            } else {
                w = imagewidth;
                h = imageheight;
            }
            x = ( thumbwidth - w ) / 2;
            y = ( thumbheight - h ) / 2;
            return { w:w, h:h, x:x, y:y };
        }
        var imageList=['images/1.jpg','images/2.jpg','images/3.jpg','images/4.jpg','images/5.jpg','images/6.jpg','images/7.jpg',
            'images/8.jpg','images/9.jpg','images/10.jpg','images/11.jpg'];
        //Get image data
        var request = {
            url: 'https://api.gettyimages.com/v3/search/images',
            method: 'GET',
            headers: {'Api-Key': 'xe4agbr6d9q4q2bjfzcqff8j'},
            data: {}
        };

        $scope.getImageData = function (query) {
            //uncomment this for searching from getty images, but due to lack of cors support, download, thumb generation doesnt work.
            /*
            if (query) request.params = {phrase: query};
            $http(request)
                .success(function (response) {
                    if (response.hasOwnProperty('images')) $scope.images = response.images;
                });
            */
            $scope.images=imageList;
        };
        $scope.getImageURL=function(image){
            //Uncomment in case of getty images
            //return image.display_sizes[0].uri;
            return image;
        };

        $scope.download = function () {
            var dataUrl = canvas.toDataURL();
            $('<a>').attr({href: dataUrl, download: 'collage.png'})[0].click();
        };
        $scope.save = function (name) {
            if(!name){
                alert("Please enter canvas name");
                return;
            }else {
                try {
                    var thumb = getThumbnail(document.getElementById("canvas")).toDataURL();
                    $scope.canvasList[name] = {obj: canvas.toObject(), thumb: thumb};
                    alert('Saved succesfully');
                }catch(e){
                    alert('Error in generating thumb.');
                }

            }
            //$('#thumbnail').replaceWith(canvasSVG);
        };

        $scope.loadCanvas=function(name,canvasObj){
            canvas.clear();
            canvas.loadFromJSON(canvasObj.obj,function(){
                canvas.renderAll();
            });
            $scope.name=name;
        };
        $scope.new=function(){
            // remove all objects and re-render
            $scope.name="";
            canvas.clear().renderAll();
        };
        $scope.sendBackwards=function(){
            var currentObject = canvas.getActiveObject();
            if(currentObject) canvas.sendBackwards(currentObject);
        };
        $scope.sendToBack=function(){
            var currentObject = canvas.getActiveObject();
            if(currentObject) canvas.sendToBack(currentObject);
        };
        $scope.bringForward=function(){
            var currentObject = canvas.getActiveObject();
            if(currentObject) canvas.bringForward(currentObject);
        };
        $scope.bringToFront=function(){
            var currentObject = canvas.getActiveObject();
            if(currentObject) canvas.bringToFront(currentObject);
        };
        $scope.delete=function(){
            var currentObject = canvas.getActiveObject();
            if(currentObject) canvas.fxRemove(currentObject);
        };

        (function init() {
            $scope.getImageData();
        })();


    }]).
    directive('collageDraggable', function () {
        return function (scope, element, attrs) {
            $(element).draggable({helper: "clone",appendTo: "body",zIndex: 10000});
        };
    }).
    directive('fabricCanvas', function () {
        return function (scope, element, attrs) {

            $(element).droppable({
                drop: function (event, ui) {

                    var imgElement = ui.draggable[0];
                    var imgInstance = new fabric.Image(imgElement, {
                        left: 100,
                        top: 100,
                        opacity: 0.85,
                        crossOrigin: 'anonymous'
                    });
                    canvas.add(imgInstance);

                }
            });
        };
    }).directive("svgobject", ['$compile','$sce',function($compile,$sce) {
    return {
        restrict: "E",
        replace:true,
        template:"<img src='data:image/svg+xml;base64,{{data}}'/>",
        link: function (scope, element, attrs) {
            scope.data = btoa($sce.trustAsHtml($compile(attrs.data)(scope)));

        }
    }
    }]).directive("minicolor", function() {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                $(element).minicolors({
                    animationSpeed: 50,
                    animationEasing: 'swing',
                    change: null,
                    changeDelay: 0,
                    control: 'hue',
                    dataUris: true,
                    defaultValue: '#ffffff',
                    hide: null,
                    hideSpeed: 100,
                    inline: false,
                    letterCase: 'lowercase',
                    opacity: false,
                    position: 'bottom left',
                    show: null,
                    showSpeed: 100,
                    theme: 'bootstrap',
                    change: function(hex, opacity) {
                        canvas.setBackgroundColor(hex,function(){
                            canvas.renderAll();
                        });
                    }
                });

            }
        }
    });

