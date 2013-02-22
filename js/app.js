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
				//logit("Done writing to file.<p/>");
			}
			if(writerOb.length<1){
				writerOb.write('[{"name":"Food 1","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"south indian"},{"name":"Food 2","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"punjabi"},{"name":"Food 3","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"chinese"},{"name":"Food 4","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"south indian"},{"name":"Food 5","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"italian"},{"name":"Food 6","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"street food"},{"name":"Food 7","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"punjabi"},{"name":"Food 8","address":"1, a street, a town, a city, AB12 3CD","rate":"9*","tel":"0123456789","email":"anemail@me.com","type":"chinese"}]');
			}	
		})
		
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
 
	
	
function Back(contacts){
    var Contact = Backbone.Model.extend({
        defaults: {
            photo: "img/placeholder.jpg",
            name: "",
            address: "",
            rate:"",
            tel: "",
            email: "",
            type: ""
        }
    });

    var ContactView = Backbone.View.extend({
        tagName: "article",
        className: "contact-container",
        template: _.template($("#contactTemplate").html()),
        editTemplate: _.template($("#contactEditTemplate").html()),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click button.delete": "deleteContact",
            "click button.edit": "editContact",
            "change select.type": "addType",
            "click button.save": "saveEdits",
            "click button.cancel": "cancelEdit"
        },

       
        deleteContact: function () {
            var removedType = this.model.get("type").toLowerCase();
            this.model.destroy();
            this.remove();

           for(var i=0;i<contacts.length;i++) {
            if(contacts[i].name==this.model.attributes.name)
            {    
                contacts.splice(i,1);
            }
           }
               
            if (_.indexOf(directory.getTypes(), removedType) === -1) {
                directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
            }
        },

       
        editContact: function () {
            this.$el.html(this.editTemplate(this.model.toJSON()));
            
            var newOpt = $("<option/>", {
                html: "<em>Add new...</em>",
                value: "addType"
            });
            this.select = directory.createSelect().addClass("type").val(this.$el.find("#type").val()).append(newOpt).insertAfter(this.$el.find(".name"));
            this.$el.find("input[type='hidden']").remove();
        },

        addType: function () {
            if (this.select.val() === "addType") {
                this.select.remove();
                $("<input />", {
                    "class": "type"
                }).insertAfter(this.$el.find(".name")).focus();
            }
        },

        saveEdits: function (e) {
            e.preventDefault();
            var formData = {},
                prev = this.model.previousAttributes();
           
            $(e.target).closest("form").find(":input").not("button").each(function () {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });
            if (formData.photo === "") {
                delete formData.photo;
            }
           
            this.model.set(formData);

            this.render();

            if (prev.photo === "/img/placeholder.png") {
                delete prev.photo;
            }

            _.each(contacts, function (contact) {
                if (_.isEqual(contact.name, prev.name)) {
                    contacts.splice(_.indexOf(contacts, contact), 1, formData);
                }
            });
        },

        cancelEdit: function () {
            this.render();
        }
    });

    var Directory = Backbone.Collection.extend({
        model: Contact
    });

    var DirectoryView = Backbone.View.extend({
        el: $("#contacts"),

        initialize: function () {
            this.collection = new Directory(contacts);

            this.render();
            this.$el.find("#filter").append(this.createSelect());

            this.on("change:filterType", this.filterByType, this);
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.renderContact, this);
            this.collection.on("remove", this.removeContact, this);
        },

        render: function () {
            this.$el.find("article").remove();

            _.each(this.collection.models, function (item) {
                this.renderContact(item);
            }, this);
        },

        renderContact: function (item) {
            var contactView = new ContactView({
                model: item
            });
            this.$el.append(contactView.render().el);
        },

        getTypes: function () {
            return _.uniq(this.collection.pluck("type"), false, function (type) {
                return type.toLowerCase();
            });
        },

        createSelect: function () {
            var filter = this.$el.find("#filter"),
                select = $("<select/>", {
                    html: "<option value='all'>All</option>"
                });

            _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item.toLowerCase(),
                    text: item.toLowerCase()
                }).appendTo(select);
            });

            return select;
        },

        events: {
            "change #filter select": "setFilter",
            "click #add": "addContact",
            "click #showForm": "showForm"
        },

        setFilter: function (e) {
            this.filterType = e.currentTarget.value;
            this.trigger("change:filterType");
        },

        filterByType: function () {
            if (this.filterType === "all") {
                this.collection.reset(contacts);
                contactsRouter.navigate("filter/all");
            } else {
                this.collection.reset(contacts, { silent: true });

                var filterType = this.filterType,
                    filtered = _.filter(this.collection.models, function (item) {
                        return item.get("type").toLowerCase() === filterType;
                    });

                this.collection.reset(filtered);

                contactsRouter.navigate("filter/" + filterType);
            }
        },

        addContact: function (e) {
            e.preventDefault();

            var formData = {};
            $("#addContact").children("input").each(function (i, el) {
                if ($(el).val() !== "") {
                    formData[el.id] = $(el).val();
                }
            });

            contacts.push(formData);

            if (_.indexOf(this.getTypes(), formData.type) === -1) {
                this.collection.add(new Contact(formData));
                this.$el.find("#filter").find("select").remove().end().append(this.createSelect());
            } else {
                this.collection.add(new Contact(formData));
            }
        },

        removeContact: function (removedModel) {
            var removed = removedModel.attributes;

            if (removed.photo === "/img/placeholder.png") {
                delete removed.photo;
            }

            _.each(contacts, function (contact) {
                if (_.isEqual(contact, removed)) {
                    contacts.splice(_.indexOf(contacts, contact), 1);
                }
            });
        },

        showForm: function () {
            this.$el.find("#addContact").slideToggle();
        }
    });

    var ContactsRouter = Backbone.Router.extend({
        routes: {
            "filter/:type": "urlFilter"
        },

        urlFilter: function (type) {
            directory.filterType = type;
            directory.trigger("change:filterType");
        }
    });

    var directory = new DirectoryView();
    var contactsRouter = new ContactsRouter();
    Backbone.history.start(); 

};

