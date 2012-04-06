(function () {	//self invoking anonymous function - ensures page has loaded correctly

	Tag = Backbone.Model.extend({
		initialize: function(tg) {
			_.bindAll(this);
			this.tag = tg.tag;
			this.amount = tg.amount;
		}
	});

	Tags = Backbone.Collection.extend({
		initialize: function(controller) {}
	});

	TagsController = Backbone.Collection.extend({
		el: $('#tags'),

		template: _.template($('#tag-template').html()),

		initialize: function(tgs) {
			_.bindAll(this);
			this.tags = new Tags(this);

			var self = this;
			tgs.forEach(function(tg){
				self.tags.add(new Tag(tg));
			});
		},

		render: function(tg) {
			$(this.el).append(this.template({'tag': tg.get('tag'), 'amount': tg.get('amount')}));
		},

		showAll: function() {
			$(this.el).empty();
			var self = this;
			this.tags.forEach(function(tg){
				self.render(tg);
			});
		}
	});

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
		},

		getTags: function(exclude) {	
			//Returns all tags from collection in order of popularity, excluding those in 'exclude'
			var tempTags = {};
			this.forEach(function(bkmrk){
				bkmrk.get('tags').forEach(function(tg){
					if(!tempTags[tg]) {		//If tag is not added
						tempTags[tg] = { 'tag': tg, 'amount': 1 };
					} else {
						tempTags[tg].amount++;
					}
				});
			});

			//Removing those in the original search
			for(var i = 0; i < exclude.length; i++) {
				delete tempTags[exclude[i]];
			}

			//Creating final array
			var tgs = new Array();
			for(var prop in tempTags) {
				tgs.push(tempTags[prop]);
			}
			tgs.sort(function(a,b){ return a.amount > b.amount ? -1 : 1 });

			return new TagsController(tgs);
		}
	});

	BookmarksController = Backbone.View.extend({
		el: $('#bookmarks'),
		
		initialize: function(bkmrks, options) {
			_.bindAll(this, 'add', 'render', 'showAll');
			this.bookmarks = new Bookmarks(this);	//Initialises model with itself (controller) as parameter

			var self = this;
			bkmrks.forEach(function(bkmrk){
				self.add(new Bookmark(bkmrk), options);
			});
		},

		template: _.template($('#bookmark-template').html()),

		render: function(bkmrk) {
			$(this.el).append(this.template({'address': bkmrk.get('address'), 'imgAddress': bkmrk.get('imgAddress')}));
		},

		add: function(bkmrk, options) {
			this.bookmarks.add(new Bookmark(bkmrk), options);
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
			this.selected = group.default ? group.default : false;
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
				self.groups.add(new Group(grp));
			})
		},

		template: _.template($('#group-template').html()),

		render: function(grp) {
			var self = this;
			var name = grp.get('name');
			var grpDiv = $(this.template({'name': name}));
			grpDiv.click(function() {
				grp.show();
				self.groups.forEach(function(gr){
					gr.selected = gr.get('name') === name;
				});
			});
			$(this.el).append(grpDiv);
		},

		addBookmark: function(grp, bkmrk) {
			this.groups.forEach(function(gr){
				if(gr.get('name') === grp) {
					gr.bookmarksController.add(bkmrk, {'silent': !gr.selected});
				}
			});
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
			if(grps) this.groupsController = new GroupsController(grps);
		},

		addBookmark: function() {
			//Save to server
			var bookmarkUrl = $('#bookmark-url').val();
			var bookmarkImageUrl = $('#bookmark-image-url').val();
			var allTags = $('#bookmark-tags').val().split(/, /);
			var priv = $('#private-bookmark').is(':checked');
			var bkmrkInfo = {address: bookmarkUrl, imgAddress: bookmarkImageUrl, tags: allTags, private: priv};
			var bookmark_model = new Bookmark(bkmrkInfo);
			var group_name = $('#group-name :selected').text();
			bookmark_model.save({group: group_name});

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

			socket.emit('addition', {'group': group_name, 'bookmark': bkmrkInfo}, function(data){});
		},

		bookmarkAdded: function(grp, bkmrk) {
			this.groupsController.addBookmark(grp, bkmrk);
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
					var suggTags = bkmrksControl.bookmarks.getTags(searchTerms);
					suggTags.showAll();
				} 
			});
		}
	});

})();