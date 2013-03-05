
 
$.mobile.pageLoadErrorMessage = false;
$.mobile.touchOverflowEnabled = true;
function Back(contacts){      
	var Contact = Backbone.Model.extend({
        defaults: {
            photo: "images/placeholder.jpg",
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
            this.$el.html(this.template(this.model.toJSON())).trigger('create');				// jquery after edit
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
            this.$el.html(this.editTemplate(this.model.toJSON())).trigger('create');			// on edit
            
            var newOpt = $("<option/>", {
                html: "<em>Add new...</em>",
                value: "addType"
            });
            this.select = directory.createSelect().addClass("type").val(this.$el.find("#type").val()).append(newOpt).insertAfter(this.$el.find("#name"));
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
            formData["photo"]= $("#pic").attr('src');
            $(e.target).closest("form").find(":input").not("button").each(function () {
                var el = $(this);
                formData[el.attr("id")] = el.val();
            });
            if (formData.photo === "") {
                delete formData.photo;
            }
           
            this.model.set(formData);

            this.render();

            if (prev.photo === "/images/placeholder.png") {
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
            this.$el.find("#filter").append(this.createSelect());						// no trigger 

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
            this.$el.append(contactView.render().el).trigger('create');		//  			 on sorting by selector  ......... trigger  it create red color 
        },

        getTypes: function () {
            return _.uniq(this.collection.pluck("type"), false, function (type) {
                return type.toLowerCase();
            });
        },

        createSelect: function () {
            var filter = this.$el.find("#filter"),
                select = $("<select  id='select' data-native-menu='false'  />");
                    $("<option value='all'>All</option>").appendTo(select);
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
		
        	this.filterType = 'all';
            this.trigger("change:filterType");
            e.preventDefault();

            var formData = {};
            formData["photo"]= $("#photo").attr('src');
            $("#addContact").children("input").each(function (i, el) {
                if ($(el).val() !== "" ) {
                    formData[el.id] = $(el).val();
                }
            });

            contacts.push(formData);

            if (_.indexOf(this.getTypes(), formData.type) === -1) {
                this.collection.add(new Contact(formData));
                this.$el.find("#filter").find("select").remove().end().append(this.createSelect()).trigger('create');  		// on new created selector
            } else {
                this.collection.add(new Contact(formData));
            }
            if( $($("#filter > div").eq(1)).length!=0) {
      		  $('#filter > div:first').remove();
      		  }
			$("#addContact").slideToggle();
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

