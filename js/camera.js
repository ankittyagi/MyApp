
function capturepic(){
	
	navigator.camera.getPicture(onPhotoFileSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI, allowEdit: true, saveToPhotoAlbum: true });
   
    function onPhotoFileSuccess(imageData) {
    		window.resolveLocalFileSystemURI(imageData, resolveOnSuccess, resOnError); 
     }
    
     function resolveOnSuccess(entry){ 
        var newFileName = "tyagi.jpg";
        var myFolderApp = "EasyPacking";

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSys) {      
         fileSys.root.getDirectory( myFolderApp,
                        {create:true, exclusive: false},
                        function(directory) {
                            entry.moveTo(directory, newFileName,  successMove, resOnError);
                        },
                        resOnError);
                        },
        resOnError);
    }

    function successMove(entry) {
        console.log(entry.Fullpath);
        readpic();
    }
    
    
    function readpic(){
    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, onFail);
    }
    function gotFS(fileSystem) {
        fileSystem.root.getFile("/sdcard/EasyPacking/tyagi.jpg", {create: true}, gotFileEntry, fail);
    }
    function gotFileEntry(fileEntry) {
        fileEntry.file(gotFile, fail);
    }

    function gotFile(file){
        readDataUrl(file);  
    }

    function readDataUrl(file) {
           var reader = new FileReader();
           reader.onloadend = function(evt) {
           console.log("Read as data URL");
           console.log(evt.target.result);           
           if(document.getElementById("pic")) {
	           document.getElementById("pic").src = evt.target.result;
	       }else if(document.getElementById("photo")) {
	    	   document.getElementById("photo").src = evt.target.result;    	  
	        }
        }; 
        reader.readAsDataURL(file);
    }

    function fail(evt) {
        console.log(evt.target.error.code);
    }

    function resOnError(error) {
    	console.log(error.code);
    }   
   
    function onFail(message) {
    	console.log('Failed because: ' + message);
    }
 
}
