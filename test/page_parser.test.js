config = require('../config/config.json');
var page_parser = require('../libs/page_parser.js');
var should = require('should');

describe('Page parser', function(){
	//Tests
	it('parses the page', function(done){
		page_parser.getPage('www.test.com', function(err, page){
			should.exist(page);
			done();
		});
	});

	it('cannot parse rubbish', function(done){
		page_parser.getPage('asdfsdfsdf', function(err, page){
			should.not.exist(page);
			done();
		});
	});

	it('cannot parse non-existing webpage', function(done){
		page_parser.getPage('http://www.idefinitelydontexist.com', function(err, page){
			should.not.exist(page);
			done();
		});
	});
});