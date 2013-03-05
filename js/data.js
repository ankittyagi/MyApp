	
	var fileSystem;
	var contacts;
	
	document.addEventListener("deviceready", onDeviceReady, true);
	
	function logit(s) {
		document.getElementById("content").innerHTML += s;
	}
	
	function onDeviceReady() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, onError);
		
		document.addEventListener("backbutton", function(e){
		          exitFromApp();  
		}, false);
	}
	
	function onFSSuccess(fs) {
		fileSystem = fs;
		console.log( "Got the file system: "+fileSystem.name +"<br/>" +"root entry name is "+fileSystem.root.name + "<p/>");   
		doAppendFile();
	} 

	function doAppendFile(e) {
		fileSystem.root.getFile("data.json", {create:true}, appendFile, onError);
	}
	
	function appendFile(f) {
		f.createWriter(function(writerOb) {
			writerOb.onwrite=function() {				
			}
			if(writerOb.length<1){
				writerOb.write(' [{"photo":"images/placeholder.jpg","name":"Food 1","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"south indian"},{"photo":"images/placeholder1.jpg","name":"Food 2","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"punjabi"},{"photo":"images/placeholder2.jpg","name":"Food 3","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"chinese"},{"photo":"images/placeholder3.jpg","name":"Food 4","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"south indian"},{"photo":"images/placeholder4.jpg","name":"Food 5","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"italian"},{"photo":"images/placeholder4.jpg","name":"Food 6","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"street food"},{"photo":"images/placeholder4.jpg","name":"Food 7","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"punjabi"},{"photo":"images/placeholder4.jpg","name":"Food 8","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"chinese"}]');
			}	
		});
		doReadFile();
	}
	
	function doReadFile(e) {
		fileSystem.root.getFile("data.json", {create:true}, readFile, onError);
	}
	function readFile(f) {
		reader = new FileReader();
		reader.onloadend = function(e) {
			contacts = JSON.parse(e.target.result);	
			Back(contacts);	
		}
		reader.readAsText(f);
	}
	
	
	function doDeleteFile(e) {fileSystem.root.getFile("data.json", {create:true}, function(f) {f.remove(function() {logit("File removed<p/>");});}, onError);}
	
	
	function onError(e) {
		getById("#content").innerHTML = "<h2>Error</h2>"+e.toString();
	}
	
	function exitFromApp()
    {
	 var writer = new FileWriter("/sdcard/data.json");
	 	if(contacts.length<1){
	 		doDeleteFile();
	 	}else{
	 		writer.write(JSON.stringify(contacts), false);
	 	}
     navigator.app.exitApp();
    }
 
	
