describe("Groups", function() {
  var app;

  beforeEach(function(){
    app = new App([{name: 'home', bookmarks: []}]);
  });

  it("initializes the applications groups controller", function() {
    should.exist(app.groupsController);
  });
});
