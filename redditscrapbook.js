Searches = new Mongo.Collection("seaches");

if (Meteor.isClient) {

  var example = "pics";
  var subReddit = example;

  Template.body.events = {
    'submit .search': function(event){
      
      event.preventDefault();
      // console.log(event)
      // Session.set("images", null);
      Session.set("noResults", null);
      subReddit = event.target.sub.value;
      Meteor.call('fetchData', subReddit, function(err, response){
        if(err){
          window.alert("Error: " + err.reason);
        }else{
          var resultsArray = [];
          var json = JSON.parse(response.content);
          var reddit = json.data.children;
          if(reddit.length > 0){
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
            // console.log(resultsArray);
            Session.set("images", resultsArray);
          }else{
            Session.set("images", null);
            Session.set("noResults", "Nothing found");
          }      
        }
        
      });
      var searchArray = Session.get("searches") || [];
      searchArray.push(
        subReddit
      );
      console.log(subReddit);
      console.log(searchArray);
      Session.set("searches", searchArray);
      event.target.sub.value = "";
    },
    'click #recentSearch': function(event){
      event.preventDefault();
      console.log(event);
      var recent = event.target.text;
      console.log(recent);
      event.target.ownerDocument.forms[0][0].value = recent;
      // event.target.ownerDocument.forms[0].submit();
    }
  }

  Template.body.helpers({
    example: example,
  });

  Template.body.rendered = function(){
    $('input[type=text]').focus();
    console.log('I been rendered');
  };

  Template.searches.helpers({
    searches: function(){
      return Session.get("searches") || [];
    }
  });

  Template.results.helpers({
    images: function(){
      return Session.get("images") || [];
    },
    noResults: function(){
      return Session.get("noResults") || [];
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
      if(response.statusCode == 200){
        return response;
      }else{
        console.log("Response issue: ", response.statusCode);
        var errorJson = JSON.parse(response.content);
        throw new Meteor.Error(response.statusCode, errorJson.error);
      }
    }
  });
}
