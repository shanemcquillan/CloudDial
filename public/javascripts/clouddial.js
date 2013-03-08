(function () {	//self invoking anonymous function - ensures page has loaded correctly

	Tag = Backbone.Model.extend({
		initialize: function(tg) {
			_.bindAll(this);
			this.tag = tg.tag;
			this.amount = tg.amount;
		}
	});

	Tags = Backbone.Collection.extend({
		model: Tag,

		initialize: function(controller) {}
	});

	TagsController = Backbone.View.extend({
		template: _.template($('#tag-template').html()),

		initialize: function(tgs, props) {
			_.bindAll(this);
			this.el = props.el;
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
				if(tg.get('tag'))
					self.render(tg);
			});
		}
	});

	Bookmark = Backbone.Model.extend({
		url: '/bookmark',

		isNew: function() {
			return false;
		},

		initialize: function(bkmrk) {
			_.bindAll(this);
			this.title = bkmrk.title,
			this.address = bkmrk.address;
			this.imgAddress = bkmrk.imgAddress;
			this.tags = bkmrk.tags;
			this.description = bkmrk.description;
			this.private = bkmrk.private;
		}
	});
	
	Bookmarks = Backbone.Collection.extend({
		model: Bookmark,

		url: function() {
			return window.location.pathname + '/bookmarks';
		},
		
		initialize: function(controller) {
			_.bindAll(this);	//Binding BookmarksView to 'this' (because of javascript's dynamic scoping) 
			this.bind('add', controller.render);	//Binding Bookmarks add method to addBookmark
			this.bind('remove', controller.removeFromView);
		}
	});

	BookmarksController = Backbone.View.extend({
		el: $('#bookmarks'),
		
		initialize: function(bkmrks, options) {
			options = options || {};

			_.bindAll(this, 'add', 'render', 'showAllBookmarks', 'getAllTags', 'removeFromView');
			this.bookmarks = new Bookmarks(this);	//Initialises model with itself (controller) as parameter

			var self = this;
			bkmrks.forEach(function(bkmrk){
				self.add(new Bookmark(bkmrk), options);
			});

			if(!options.silent) {
				var tgs = this.getAllTags();
				(new TagsController(tgs, {el: '#selection-tags'})).showAll();
				$('#selection-tags').change();
			}
		},

		template: _.template($('#bookmark-template').html()),

		render: function(bkmrk) {
			var tagStr = "";
			var tags = bkmrk.get('tags');
			if(tags) {
				for(var i = 0; i < tags.length; i++) {
					tagStr+=(tags[i] + ", ");
				}
			}
			var bkmrkView = $(this.template({'address': bkmrk.get('address'), 'imgAddress': bkmrk.get('imgAddress'), 'title': bkmrk.get('title'), 'description': bkmrk.get('description'), 'tags': tagStr}));
			var self = this;

			$(bkmrkView.find('.del-bookmark')[0]).click(function(){
				bkmrk.set({'group': self.parent.get('name')});
				bkmrk.destroy();

				var index = -1;
				for(var i = 0; i < self.bookmarks.length; i++) {
					if(self.bookmarks.at(i).get('address') === bkmrk.get('address')) {
						index = i;
						break;
					}
				}
				self.bookmarks.remove(bkmrk);
				self.removeFromView(index-1);

				var tgs = self.getAllTags();
				(new TagsController(tgs, {el: '#selection-tags'})).showAll();
				$('#selection-tags').change();
			});

			$(bkmrkView.find('.info-bookmark')[0]).hover(function(){
				$(bkmrkView.find('.tooltip')[0]).toggleClass('hidden');
			});

			var addBkmrk = $(this.el).find('#create-bookmark');
			if(addBkmrk.length > 0) {
				addBkmrk.before(bkmrkView);
			} else {
				$(this.el).append(bkmrkView);
			}
		},

		add: function(bkmrk, options) {
			this.bookmarks.add(new Bookmark(bkmrk), options);
		},

		showAllBookmarks: function() {
			var addBkmrk = $(this.el).find('#create-bookmark');
			if(addBkmrk.length > 0) {
				var beforeAdd = $(this.el).find('li:not(:last)');
				beforeAdd.remove();
			} else {
				$(this.el).empty();
			}

			var self = this;
			this.bookmarks.forEach(function(bkmrk){
				if(bkmrk.get('address')) {
					self.render(bkmrk);
				}
			});
		},

		getAllTags: function() {
			//Returns all tags from collection in order of popularity
			var tempTags = {};
			this.bookmarks.forEach(function(bkmrk){
				var tags = bkmrk.get('tags');
				if(tags) {
					tags.forEach(function(tg){
						if(!tempTags[tg]) {		//If tag is not added
							tempTags[tg] = { 'tag': tg, 'amount': 1 };
						} else {
							tempTags[tg].amount++;
						}
					});
				}
			});

			//Creating final array
			var tgs = new Array();
			for(var prop in tempTags) {
				tgs.push(tempTags[prop]);
			}
			tgs.sort(function(a,b){ return a.amount > b.amount ? -1 : 1 });

			return tgs;
		},

		removeFromView: function(index) {
			$((this.el).children()[index]).remove();
		}
	});

	Group = Backbone.Model.extend({
		url: function() {
			return window.location.pathname + '/group';
		},

		initialize: function(group) {
			_.bindAll(this);
			//First time group is initialised groupcontroller is passed
			this.bookmarksController = new BookmarksController(group.bookmarks ? group.bookmarks : new Array(), {silent: group.isDefault ? false : true});
			this.bookmarksController.parent = this;
			this.name = group.name;
			this.selected = group.isDefault ? group.isDefault : false;
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
				var newGroup = new Group(grp);
				self.groups.add(newGroup);
				if(grp.isDefault) {
					self.currentGroup = newGroup;
				}
			});
			self.updateAllTags();
		},

		template: _.template($('#group-template').html()),

		render: function(grp) {
			var self = this;
			var name = grp.get('name');
			var grpDiv = $(this.template({'name': name}));
			grpDiv.click(function() {
				self.currentGroup = grp;
				self.showGroup(grp);
				self.groups.forEach(function(gr){
					gr.selected = gr.get('name') === name;
				});
			});

			var addGrp = $(this.el).find('#create-group');
			if(addGrp.length > 0) {
				addGrp.before(grpDiv);
			} else {
				$(this.el).append(grpDiv);
			}
		},

		addBookmark: function(grp, bkmrk) {
			this.groups.forEach(function(gr){
				if(gr.get('name') === grp) {
					gr.bookmarksController.add(bkmrk, {'silent': !gr.selected});
					var tgs = gr.bookmarksController.getAllTags();
					(new TagsController(tgs, {el: '#selection-tags'})).showAll();
					$('#selection-tags').change();
				}
			});
		},

		addGroup: function(grp) {
			this.groups.add(grp);
		},

		showGroup: function(grp) {
			grp.bookmarksController.showAllBookmarks();
			var tgs = grp.bookmarksController.getAllTags();
			(new TagsController(tgs, {el: '#selection-tags'})).showAll();
		},

		getSelectedGroup: function() {
			for(var i = 0; i < this.groups.length; i++) {
				var grp = this.groups.at(i);
				if(grp.selected) {
					return grp.get('name');
				}					
			}		
		},

		getAllTags: function() {
			var tempTags = {};
			this.groups.forEach(function(grp){
				var grpTags = grp.bookmarksController.getAllTags();
				grpTags.forEach(function(tg){
					var element = tempTags[tg.tag];
					if(!element) {
						tempTags[tg.tag] = tg;
					} else {
						element.amount+=tg.amount;
						tempTags[tg.tag] = element;
					}
				});
			});

			//Creating final array
			var tgs = new Array();
			for(var prop in tempTags) {
				tgs.push(tempTags[prop]);
			}
			tgs.sort(function(a,b){ return a.amount > b.amount ? -1 : 1 });

			return tgs;
		},

		updateAllTags: function() {
			var tgs = this.getAllTags();
			(new TagsController(tgs, {el: '#all-tags'})).showAll();	
		}
	});
	
	window.App = Backbone.View.extend({
		el: $('#page'),

		events: {
			'click #add-group': 'addGroup',
			'keypress #search-terms': 'checkForSubmit',
			'click #add-group-button': 'showAddGroupPopUp',
			'click #popupContactClose': 'disablePopup',
			'click #backgroundPopup': 'disablePopup',
			'click .co': 'addToSearch',
			'click #clear-search': 'clearSearch',
			'click #create-bookmark': 'showAddBookmarkPopUp',
			'click #open-savescreen': 'openSavescreen'
		},

		initialize: function(grps) {
			this.groupsController = new GroupsController(grps);
			this.popupStatus = 0;
			var self = this;
			$('#selection-tags').change(function(){
				self.groupsController.updateAllTags();
			});
		},

		bookmarkAdded: function(grp, bkmrk) {
			this.groupsController.addBookmark(grp, bkmrk);
		},

		addGroup: function() {
			var groupName = $('#group-name').val();
			var privGroup = $('#private-group').is(':checked');
			var grp = new Group({name: groupName, private: privGroup});
			grp.save();
			this.disablePopup();
			this.groupsController.addGroup(grp);
		},

		checkForSubmit: function(e) {
			if(e.which == 13) {
				this.searchBookmarks();
			}
		},

		searchBookmarks: function() {
			var self = this;
			var searchStr = $('#search-terms').val().trim();
			if(searchStr.length > 0) {
				var searchTerms = searchStr.split(/, /);
				var bkmrksControl = new BookmarksController(new Array());
				bkmrksControl.bookmarks.fetch({ data: $.param({'tags': searchTerms}), success: function(){
						bkmrksControl.showAllBookmarks();
						var tgs = bkmrksControl.getAllTags(/*{ 'exclude': searchTerms }*/);
						(new TagsController(tgs, {el: '#selection-tags'})).showAll();
					} 
				});
			}
		},

		addToSearch: function(e) {
			var searchTerms = $('#search-terms').val();	//TODO: Use find
			var extraTerm = e.currentTarget.getElementsByClassName('name')[0].innerHTML;
			$('#search-terms').val(searchTerms + (searchTerms === '' ? '' : ', ') + extraTerm);
			this.searchBookmarks();
			$('#search-terms').focus();
		},

		clearSearch: function(e) {
			$('#search-terms').val('');
			this.groupsController.showGroup(this.groupsController.currentGroup);
		},

		loadPopup: function() {
			//loads popup only if it is disabled  
			if(this.popupStatus==0){  
				$("#backgroundPopup").css({  
					"opacity": "0.7"  
				});  
				$("#backgroundPopup").fadeIn("slow");  
				$("#popupContact").fadeIn("slow");  
				this.popupStatus = 1;  
			}  
		},
		
		disablePopup: function(){  
			//disables popup only if it is enabled  
			if(this.popupStatus==1){  
				$("#backgroundPopup").fadeOut("slow");  
				$("#popupContact").fadeOut("slow");  
				this.popupStatus = 0;  
			}  
		},
		
		centerPopup: function(){  
			//request data for centering  
			var windowWidth = document.documentElement.clientWidth;  
			var windowHeight = document.documentElement.clientHeight;  
			var popupHeight = $("#popupContact").height();  
			var popupWidth = $("#popupContact").width();  
			//centering  
			$("#popupContact").css({  
				"position": "absolute",  
				"top": windowHeight/2-popupHeight/2,  
				"left": windowWidth/2-popupWidth/2  
			});  
			//only need force for IE6  
			  
			$("#backgroundPopup").css({  
				"height": windowHeight  
			});  	  
		},

		showAddGroupPopUp: function() {
			$('#popup-content').html($('#add-group-content').clone().removeClass('hidden'));
			this.setupPopup();
			$('#group-name').val('');
			$('#group-name').focus();
		},

		showAddBookmarkPopUp: function() {
			$('#popup-content').html($('#add-bookmark-content').clone().removeClass('hidden'));
			this.setupPopup();
			$('#bookmark-address').val('');
			$('#bookmark-address').focus();
		},
		
		setupPopup: function() {
			this.centerPopup();
			this.loadPopup();
		},

		openSavescreen: function() {
			var bookmarkUrl = $('#bookmark-address').val();
			var f = 'http://localhost:4444/savescreen?address='
				+ encodeURIComponent(bookmarkUrl)
				+ '&group='
				+ encodeURIComponent(this.groupsController.getSelectedGroup());
			var a = function() {
					if(!window.open(f,'deliciousuiv6','location=yes,links=no,scrollbars=no,toolbar=no,width=550,height=550'))
						location.href = f + 'jump=yes'
				};
			if(/Firefox/.test(navigator.userAgent)) {
				setTimeout(a,0);
			} else {
				a();
			}
			this.disablePopup();
		}
	});

	window.SaveScreenController = Backbone.View.extend({
		el: $('#page'),

		events: {
			'click #add-bookmark': 'addBookmark',
			'click .co': 'addTag'
		},

		addBookmark: function() {
			$("*").css("cursor", "progress");
			//Save to server
			var bookmarkTitle = $('#bookmark-title').val();
			var bookmarkUrl = $('#bookmark-url').text();
			var bookmarkImageUrl = $('#bookmark-image-url').val();
			var allTags = $('#bookmark-tags').val().split(/, /);
			var desc = $('#bookmark-desc').val();
			var priv = $('#private-bookmark').is(':checked');
			var bkmrkInfo = {title: bookmarkTitle, address: bookmarkUrl, imgAddress: bookmarkImageUrl, tags: allTags, description: desc, private: priv};
			var bookmark_model = new Bookmark(bkmrkInfo);
			var group_name = $('#group-name :selected').text();
			bookmark_model.save({group: group_name});

			var finished = function() {
				socket.emit('addition', {'group': group_name, 'bookmark': bkmrkInfo}, function(data){});
				window.close();
			}

			//Post on user's FB Timeline
			if(!priv) {
				FB.api(
					'/me/clouddial:add?website=' + bookmark_model.get('address'),	//Assume it's a website
					'post',
					function(response) {
						if(response.error && response.error.code == 3502) {	//Incorrect object hack
							var objType = response.error.message.split('\'')[1];
							//message format 23/5: 
							//(#3502) Object at URL http://example.com/ has og:type of 'article'
							//0:[(#3502) Object at URL http://example.com/ has og:type of ] 1:[article]
							FB.api(
								'/me/clouddial:add?' + objType + '=' + bookmark_model.get('address'),
								'post',
								function(resp){
									finished();
								}
							);
						} else {
							finished();
						}
					}
				);
			} else {
				finished();
			}
		},

		addTag: function(e) {
			var existingTags = $('#bookmark-tags').val();
			var extraTag = e.currentTarget.getElementsByClassName('name')[0].innerHTML;
			$('#bookmark-tags').val(existingTags + (existingTags === '' ? '' : ', ') + extraTag);
			$('#bookmark-tags').focus();
		}
	});

	Image = Backbone.Model.extend({
		initialize: function(img) {
			_.bindAll(this);
			this.address = img.address;
		}
	});

	Images = Backbone.Collection.extend({
		model: Image,

		initialize: function(controller) {
			this.bind('add', controller.render);
		}
	});

	window.ImagesController = Backbone.View.extend({
		el: $('#image-selection'),

		template: _.template($('#image-template').html()),

		events: {
			'change #bookmark-image-url': 'setImage',
			'click .sugg-image': 'changeCurrent'
		},

		initialize: function(imgs) {
			_.bindAll(this);
			this.images = new Images(this);
			this.currentImage = imgs[0];

			var self = this;
			imgs.forEach(function(img){
				self.images.add(new Image({address: img}));
			});

			this.showCurrent();
			$('.sugg-image').mouseover(this.tempChangeCurrent);
			$('.sugg-image').mouseout(this.showCurrent);
		},

		render: function(img) {
			if(img.get('address') !== this.currentImage) {
				$('#suggested-images').append(this.template({'address': img.get('address')}));
			}
		},

		showCurrent: function() {
			if(this.currentImage) {
				$('#current-image').html(this.template({'address': this.currentImage}));
				$('#bookmark-image-url').val(this.currentImage);
			}
		},

		changeCurrent: function(e) {
			this.currentImage = e.currentTarget.src;
			this.showCurrent();
		},

		tempChangeCurrent: function(e) {
			$('#current-image').html(this.template({'address': e.currentTarget.src}));		
		},

		setImage: function() {
			var imgUrl = $('#bookmark-image-url').val();
			this.currentImage = imgUrl;
			$('#current-image').html(this.template({'address': imgUrl}));
		}
	});

})();