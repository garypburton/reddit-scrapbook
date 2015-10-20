if (Meteor.isClient) {

  var example = "pics";
  var subReddit = example;

  Template.body.events = {
    'submit .search': function(event){
      event.preventDefault();
      // console.log(event)
      // Session.set("images", null);
      subReddit = event.target.sub.value;
      Meteor.call('fetchData', subReddit, function(err, response){
        if(err){
          window.alert("Error: " + err.reason);
        }else{
          var resultsArray = [];
          var json = JSON.parse(response.content);
          var reddit = json.data.children;
          for(var i = 0; i < reddit.length; i++) {
            var obj = reddit[i];
            var src = obj.data.url;
            var img = new Image();
            img.onload = function(src) { 
              if(src.indexOf('.png') > 0 || src.indexOf('.jpg') > 0 || src.indexOf('.gif') > 0 && src.indexOf('.gifv') <= 0){
                // console.log(img);
                resultsArray.push(
                  {url:src}
                );
              } 
            }(src)
            img.src = src;
          }       
        }
        // console.log(resultsArray);
        Session.set("images", resultsArray);
      });
      event.target.sub.value = "";
    }
  }

  Template.body.helpers({
    example: example,
  });

  Template.results.helpers({
    images: function(){
      return Session.get("images") || [];
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.methods({
    fetchData: function(subReddit){
      var url = "http://reddit.com/r/" + subReddit + "/hot.json?limit=50";
      var response = HTTP.get(url, {timeout:30000});
      return response;
    }
  });
}
