(function () {	//self invoking anonymous function - ensures page has loaded correctly		

	Bookmark = Backbone.Model.extend({
		url: '/bookmark',

		initialize: function(bkmrk) {
			_.bindAll(this);	
			this.address = bkmrk.address;
			this.imgAddress = bkmrk.imgAddress;
			this.tags = bkmrk.tags;
			this.private = bkmrk.private;
		}
	});
	
	Bookmarks = Backbone.Collection.extend({
		model: Bookmark,

		url: '/bookmarks',
		
		initialize: function(controller) {
			_.bindAll(this);	//Binding BookmarksView to 'this' (because of javascript's dynamic scoping) 
			this.bind('add', controller.render);	//Binding Bookmarks add method to addBookmark
		}
	});

	BookmarksController = Backbone.View.extend({
		el: $('#bookmarks'),
		
		initialize: function(bkmrks, options) {
			_.bindAll(this, 'render');
			this.bookmarks = new Bookmarks(this);	//Initialises model with itself (controller) as parameter
		
			var self = this;
			bkmrks.forEach(function(bkmrk){
				var bk = new Bookmark(bkmrk);
				self.bookmarks.add(bk, options);
			});
		},

		template: _.template($('#bookmark-template').html()),

		render: function(bkmrk) {
			$(this.el).append(this.template({'address': bkmrk.get('address'), 'imgAddress': bkmrk.get('imgAddress')}));
		},

		showAll: function() {
			$(this.el).empty();
			var self = this;
			this.bookmarks.forEach(function(bkmrk){
				self.render(bkmrk);
			});
		}
	});

	Group = Backbone.Model.extend({
		url: '/group',

		initialize: function(group) {
			_.bindAll(this);
			//First time group is initialised groupcontroller is passed
			this.bookmarksController = new BookmarksController(group.bookmarks ? group.bookmarks : new Array(), {silent: group.default ? false : true});
			this.name = group.name;
		},

		show: function() {
			this.bookmarksController.showAll();
		}
	});

	Groups = Backbone.Collection.extend({
		model: Group,
		
		initialize: function(controller) {
			_.bindAll(this);
			this.bind('add', controller.render);
		}
	});

	GroupsController = Backbone.View.extend({
		el: $('#groups'),
		
		initialize: function(grps) {
			_.bindAll(this);
			this.groups = new Groups(this);	//Initialises model with itself (controller) as parameter
	
			var self = this;
			grps.forEach(function(grp) {
				var gr = new Group(grp);
				self.groups.add(gr);
			})
		},

		template: _.template($('#group-template').html()),

		render: function(grp) {
			var grpDiv = $(this.template({'name': grp.get('name')}));
			grpDiv.click(grp.show);
			$(this.el).append(grpDiv);
		}
	});
	
	window.App = Backbone.View.extend({
		el: $('#page'),

		events: {
			'click #add-bookmark': 'addBookmark',
			'click #add-group': 'addGroup',
			'click #search': 'searchBookmarks' 
		},

		initialize: function(grps) {
			if(grps) this.groups = new GroupsController(grps);
		},

		addBookmark: function() {
			//Save to server
			var bookmarkUrl = $('#bookmark-url').val();
			var bookmarkImageUrl = $('#bookmark-image-url').val();
			var allTags = $('#bookmark-tags').val().split(/, /);
			var priv = $('#private-bookmark').is(':checked');
			var bkmrkInfo = {address: bookmarkUrl, imgAddress: bookmarkImageUrl, tags: allTags, private: priv};
			var bookmark_model = new Bookmark(bkmrkInfo);
			bookmark_model.save({group: $('#group-name :selected').text()});

			//Post on user's FB Timeline
			FB.api(
				'/me/clouddial:add?website=' + bookmark_model.get('address'),	//Assume it's a website
				'post',
				function(response) {
					if(response.error) {
						if(response.error.code == 3502) {	//Incorrect object hack
							var objType = response.error.message.split('\'')[1];
							//message format 23/3: (#3502) Object at URL http://example.com/ has og:type of 'article'
							//0:[(#3502) Object at URL http://example.com/ has og:type of ] 1:[article]
							FB.api(
								'/me/clouddial:add?' + objType + '=' + bookmark_model.get('address'),
								'post',
								function(resp){}
							);
						}
					}
				}
			);
		},

		addGroup: function() {
			var groupName = $('#group-name').val();
			var grp = new Group({name: groupName});
			grp.save();
		},

		searchBookmarks: function() {
			var searchTerms = $('#search-terms').val().split(/, /);
			var bkmrksControl = new BookmarksController(new Array());
			bkmrksControl.bookmarks.fetch({ data: $.param({'tags': searchTerms}), success: function(){
					bkmrksControl.showAll();
				} 
			});
		}
	});

})();