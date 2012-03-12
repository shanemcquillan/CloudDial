(function () {	//self invoking anonymous function - ensures page has loaded correctly		
//Bookmark object
	Bookmark = Backbone.Model.extend({
		address: null,
		imgAddress: null,
		tags: {},
		private: false,

		url: '/save'
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
			"click #add-bookmark": "addBookmark"		//Binds click on element add-bookmark to addBookmark
			// "keypress #bookmark-tags": "addTag"
		},
		
		addBookmark: function() {
			var bookmarkUrl = $("#bookmark-url").val();
			var bookmarkImageUrl = $("#bookmark-image-url").val();
			var allTags = $('#bookmark-tags').val().split(/, /);
			var bookmark_model = new Bookmark({address: bookmarkUrl, imgAddress: bookmarkImageUrl, tags: allTags, private: $("#private-bookmark").is(":checked")});
			this.bookmarks.add(bookmark_model);		//update model
			bookmark_model.save();
			FB.getLoginStatus(function(res) {
				FB.api(
					'/me/clouddial:add?' + 'access_token=' + res.authResponse.accessToken 
					+ '&website=' + bookmark_model.get('address'),
					'post',
					function(response) {
						if (!response || response.error) {
								console.log('Error occured 2');
						} else {
								console.log('Cook was successful! Action ID: ' + response.id);
						}
					}
				);
				FB.api(
					'/me/clouddial:add?' + 'access_token=' + res.authResponse.accessToken 
					//+ '&website=' + bookmark_model.get('address')
					+ '&article=' + bookmark_model.get('address'),
					'post',
					function(response) {
						if (!response || response.error) {
								console.log('Error occured 1');
						} else {
								console.log('Cook was successful! Action ID: ' + response.id);
						}
					}
				);
			});
		},
		
		updateBookmarkView: function(bookmark) {
			//Update view with model values
			$(this.el).append("<a href=\"" + bookmark.get('address') + "\">" + "<img src=\"" + bookmark.get('imgAddress') + "\"/></a>");
		},

		updateAllBookmarksView: function() {
			for(var i = 0; i < this.bookmarks.length; i++) {
				var bookmark = this.bookmarks.at(i);
				$(this.el).append("<a href=\"" + bookmark.get('address') + "\">" + "<img src=\"" + bookmark.get('imgAddress') + "\"/></a>");
			}
		},

		// addTag: function(event) {
		// 	if(event.which == 188) {
				
		// 	}
		// }
	});
	
	var bookmarksController = new BookmarksController;	//Initialise controller
	window.bookmarksController = bookmarksController;
})();