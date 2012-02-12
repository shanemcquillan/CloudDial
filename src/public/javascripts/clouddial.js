(function () {	//self invoking anonymous function - ensures page has loaded correctly		
//Bookmark object
	Bookmark = Backbone.Model.extend({
		address: null,
		imgAddress: null,

		url: '/save',
	
		getBookmarkAddress: function() {
			return this.get("address");
		},
	
		getBookmarkImgAddress: function() {
			return this.get("imgAddress");
		},
		
		clone: function() {
			return jQuery.extend(true, {}, this);
		},
		
		equals: function(other) {
			return _.isEqual(this, other);
		},
		
		//Implementing serializable
		serialize : function() {
			return JSON.stringify(this);
		},
		
		deserialize : function(serialObj) {
			return JSON.parse(serialObj);
		}
	});
	
//Private bookmark object
	PrivateBookmark = Bookmark.extend({	//extends bookmark
		//@Override
		getBookmarkImgAddress: function() {
			return '/images/private.jpg';
		}
	});
	
//Bookmarks collection
	Bookmarks = Backbone.Collection.extend({
		model: Bookmark,
		
		initialize: function(controller) {
			_.bindAll(this);	//Binding BookmarksView to "this" (because of javascript's dynamic scoping) 
			this.bind("add", controller.updateBookmarkView);	//Binding Bookmarks add method to addBookmark
			this.bind("reset", controller.updateAllBookmarksView);
		},
	
		listAll: function() {	//For testing
			for(var i = 0; i < this.length; i++) {
				console.log(this.at(i).attributes);
			}
		},

		clone: function() {
			return jQuery.extend(true, {}, this);
		},
		
		equals: function(other) {
			return _.isEqual(this, other);
		},
		
		//Implementing serializable
		serialize : function() {
			return JSON.stringify(this);
		},
		
		deserialize : function(serialObj) {
			return JSON.parse(serialObj);
		}
	});

//Bookmarks controller
	window.BookmarksController = Backbone.View.extend({
		//Somewhat unintuitively, Backbone.View actually acts as a controller between the model and the html representation(the actual view).
		el: $("#page"),	//Controller for element with id 'page;
		
		initialize: function() {
			_.bindAll(this);
			this.bookmarks = new Bookmarks(this);	//Initialises model with itself (controller) as parameter
		},
		
		events: {
			"click #add-bookmark": "addBookmark",		//Binds click on element add-bookmark to getValues
		},
		
		addBookmark: function() {
			var bookmarkUrl = $("#bookmark-url").val();
			var bookmarkImageUrl = $("#bookmark-image-url").val();
			var bookmark_model = $("#private-bookmark").is(":checked") //Is it a private bookmark?
									? new PrivateBookmark({address: bookmarkUrl, imgAddress: bookmarkImageUrl}) 
									: new Bookmark({address: bookmarkUrl, imgAddress: bookmarkImageUrl});
			this.bookmarks.add(bookmark_model);		//update model
			bookmark_model.save();
		},
		
		updateBookmarkView: function(model) {
			//Update view with model values
			$(this.el).append("<a href=\"" + model.getBookmarkAddress() + "\">" + "<img src=\"" + model.getBookmarkImgAddress() + "\"/></a>");
		},

		updateAllBookmarksView: function() {
			for(var i = 0; i < this.bookmarks.length; i++) {
				var bookmark = this.bookmarks.at(i);
				$(this.el).append("<a href=\"" + bookmark.get('address') + "\">" + "<img src=\"" + bookmark.get('imgAddress') + "\"/></a>");
			}
		}
	});
	
	var bookmarksController = new BookmarksController;	//Initialise controller
	window.bookmarksController = bookmarksController;
})();