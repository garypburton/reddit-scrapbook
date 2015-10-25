Searches = new Mongo.Collection("seaches");
Images = new Mongo.Collection("images");

if (Meteor.isClient) {

  var example = "pics";
  var subReddit = example;

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

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
          function imageExists(url, callback) {
            var img = new Image();
            img.onload = function() { callback(true); };
            img.onerror = function() { callback(false); };
            img.src = url;
          }
          var resultsArrayUn = [];
          var json = JSON.parse(response.content);
          var reddit = json.data.children;
          if(reddit.length > 0){
            for(var i = 0; i < reddit.length; i++) {
              var obj = reddit[i];
              var src = obj.data.url;
              // var img = new Image();
              // img.onload = function() { 
              //   if(src.indexOf('.png') > 0 || src.indexOf('.jpg') > 0 || src.indexOf('.gif') > 0 && src.indexOf('.gifv') <= 0){
              //     console.log(img);
              //     resultsArray.push(
              //       src
              //     );
              //   } 
              //   console.log('URL: '+src+' did work');
              // }(src);

              // img.onerror = function(){
              //   console.log('URL: '+src+' did not work');
              // }(src);

              // img.src = src;
              resultsArrayUn.push(
                src
              );
            } 
            // console.log(resultsArrayUn);
            function preloadimages(arr){
              var newimages=[], loadedimages=0
              var postaction=function(){}
              var arr=(typeof arr!="object")? [arr] : arr
              function imageloadpost(){
                  loadedimages++
                  if (loadedimages==arr.length){
                      postaction(newimages) //call postaction and pass in newimages array as parameter
                  }
              }
              for (var i=0; i<arr.length; i++){
                  newimages[i]=new Image()
                  newimages[i].src=arr[i]
                  newimages[i].onload=function(){
                      imageloadpost()
                  }
                  newimages[i].onerror=function(){
                      imageloadpost()
                  }
              }
              return { //return blank object with done() method
                  done:function(f){
                      postaction=f || postaction //remember user defined callback functions to be called when images load
                  }
              }
            }
            preloadimages(resultsArrayUn).done(function(images){
              //call back codes, for example:
              var resultsArray = [];
              for(var i=0; i<images.length; i++){
                var img = images[i];
                // console.log(img);
                // console.log(checkedUrl);
                if(img.height > 0){
                  resultsArray.push(
                    img.src
                  );
                }
              }
              // console.log(resultsArray);
              Session.set("imageResults", resultsArray);
            });
            
            
          }else{
            Session.set("imageResults", null);
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
    } 
  };

  Template.search.events = {
    'click .recent': function(event){
      event.preventDefault();
      console.log(event);
      var recent = event.target.text;
      console.log(recent);
      event.target.ownerDocument.forms[0][0].value = recent;
      event.target.ownerDocument.forms[0][0].focus();
      // event.target.ownerDocument.forms[0].submit();
    },
  };

  Template.image.events = {
    'click .save': function(event){
      event.preventDefault();
      var url = event.target.parentNode.firstElementChild.currentSrc;
      console.log(event);
      Meteor.call("saveImg", url, function(error, result){
        if(!error){
          console.log(result);
          $(event.target).fadeOut('slow');
        }
      });
      // Meteor.call("saveImg", url);
      // Meteor.call("setSaved", this._id, ! this.saved);
    }
    // 'click .delete': function(event){
    //   Meteor.call("deleteSaved", this._id);
    //   Meteor.call("deleteSaved", this._id, function(error, result){
    //     if(!error){
    //       console.log(result);
    //       $(event.target).fadeOut('slow', function(){
    //         $(this).prev('.save').fadeIn('fast');
    //       });
    //     }
    //   });
    // }
  };

  // Handlebars.registerHelper('saved', function() {
  //   savedID = Session.get('_id');
  //   return Images.findOne( savedID );
  // });

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
    imageResults: function(){
      return Session.get("imageResults") || [];
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
    },
    saveImg: function (imgUrl) {
      // Make sure the user is logged in before inserting a task
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      return Images.insert({
        savedUrl: imgUrl,
        createdAt: new Date(),
        owner: Meteor.userId(),
        username: Meteor.user().username
      });
    },
    deleteSaved: function (taskId) {
      Images.remove(taskId);
    },
    setSaved: function (taskId, setSaved) {
      Images.update(taskId, { $set: { saved: setSaved} });
    }
  });

    
}
