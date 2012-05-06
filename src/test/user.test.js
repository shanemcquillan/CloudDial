var mongoose = require('mongoose');
var config = require('../config/config.json');
mongoose.connect('mongodb://' + config.db_ip + '/' + config.db_name);

var user = require('../models/user.js');
var should = require('should');
var promise = require('everyauth').Promise;

describe('Users', function(){
	beforeEach(function(done){
		var prom = new promise();
		user.findOrCreateByUidAndNetwork(10, 'facebook', {'username': 'test'}, prom, done);
	});

	afterEach(function(done){
		user.removeUser('test', done);
	});

	//Tests
	it('finds existing user', function(done){
		user.findUserByUsername('test', function(err, usr){
			usr._doc.username.should.equal('test');
			done();
		});
	});

	it('user does not exist', function(done){
		user.findUserByUsername('fake', function(err, usr){
			should.not.exist(usr);
			done();
		});
	});

	it('adding bookmark to user', function(done){
		user.addBookmark('test', 'home', {'address': 'www.test.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1', 'test2'], 'private': false}, function(err){
			user.getGroup('test', 'home', function(err, grp){
				grp.bookmarks[0].address.should.equal('www.test.com');
				grp.bookmarks[0].imgAddress.should.equal('www.testimage.com');
				grp.bookmarks[0].tags[0].should.equal('test1');
				grp.bookmarks[0].tags[1].should.equal('test2');
				done();
			});
		});
	});
	
	it('gets public bookmarks only', function(done){
		user.addBookmark('test', 'home', {'address': 'www.test.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1'], 'private': false}, function(err){
			user.addBookmark('test', 'home', {'address': 'www.test2.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1'], 'private': true}, function(err){
				user.getPublicBookmarks(
					'test',  
					function(grps) {
						grps[0].bookmarks.length.should.equal(1);
						grps[0].bookmarks[0].address.should.equal('www.test.com');
						done();
					}
				);
			});	
		});		
	});

	it('adding bookmarks to other groups', function(done){
		user.addGroup('test', {name: 'another'}, function(err){
			user.addBookmark('test', 'home', {'address': 'www.test.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1'], 'private': false}, function(err){
				user.addBookmark('test', 'another', {'address': 'www.test2.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1'], 'private': true}, function(err){
					user.getBookmarks(
						'test', 
						function(grp){
							return true;
						}, 
						function(grps){
							grps.length.should.equal(2);
							grps[0].bookmarks.length.should.equal(1);
							grps[0].bookmarks[0].address.should.equal('www.test.com');
							grps[1].bookmarks.length.should.equal(1);
							grps[1].bookmarks[0].address.should.equal('www.test2.com');
							done();
						}
					);
				});	
			});
		});	
	});

	it('getting group names', function(done){
		user.addGroup('test', {'name': 'another'}, function(err){
			user.addBookmark('test', 'home', {'address': 'www.test.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1'], 'private': false}, function(err){
				user.addBookmark('test', 'another', {'address': 'www.test2.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1'], 'private': true}, function(err){
					user.getGroupNames('test', function(err, grpNames) {
						grpNames[0].should.equal('home');
						grpNames[1].should.equal('another');
						done();
					});
				});	
			});
		});	
	});

	it('get bookmarks of non existing user', function(done){
		user.getBookmarks(
			'fake', 
			function(bkmrk) {},
			function(bkmrks) {
				should.not.exist(bkmrks);
				done();
			}
		);	
	});
});