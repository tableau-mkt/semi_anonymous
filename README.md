Semi Anonymous Drupal module
==============

Track in order to react to anonymous user behavior.
Provide localStorage space, output meta data, store user origins, and handle stashing of client-side data.

##User Info
For ease of interaction, data is stashed in JSON format, duh. One of the most basic featurse is just
knowing where a user came from.
```json
{
  "user.origin" : {
    "url" : "http://www.mysite.com/some-great-page",
    "timestamp" : "55555",
    "referrer" : "http://www.anothersite.com/their-linking-page"
  }
  "user.session_origin" : {
    "url" : "http://www.mysite.com/recent-entry-point",
    "timestamp" : "55555"
  }
}
```

It's recommended that you wait until the use object is available. Here's some same JS code.
```javascript
(function($) {
  $(document).ready(function() {
    Drupal.settings.semi_anonymous.userDeferred = Drupal.settings.semi_anonymous.userDeferred || $.Deferred();
    // Ensure data availability.
    Drupal.settings.semi_anonymous.user_deferred.done(function () {

      // Access data stored in localStorage like this.
      // See the jStorage site for more info: http://www.jstorage.info
      var origin = JSON.parse($.jStorage.get('user.origin'));

      // Store your own items.
      myObj.something = 'Special info';
      myObj.anotherThing = 'More info';
      $.jStorage.set('user.thing', JSON.stringify(myObj));
  
    }
  });
})(jQuery);
```

##Meta Data Output
In order to do fun and fancy things on the client-side it's nice to have easy access to the meta data
about the pages of our site. Yes, you might be able to get this from the DOM, but it's good to be sure.
You can pipe out whatever data you want in a custom module by implementing the
hook_semi_anonymous_output_properties() function. Here's some of what's available by default.
```json
{
  "nid" : "123",
  "title" : "My Cool Page",
  "uid" : "555",
  "language" : "en",
  "taxonomy" : {
    "special_category" : {
      "25" : "Term Name",
      "26" : "Another Term"
    }
    "my_types" : {
      "13" : "Some Tag",
      "14" : "Another Tag"
    }
  }
}
```

Grab ahold of those goodies.
```javascript
(function($) {
  $(document).ready(function() {

    // Access meta data like this.
    var pageAuthorUID = Drupal.settings.semi_anonymous_meta.uid,
        pageTitle = Drupal.settings.semi_anonymous_meta.title,
        pageLanguage = Drupal.settings.semi_anonymous_meta.language;

  });
})(jQuery);
```

##Activity Tracking
User's browsing history is stored like this. Example shown with taxonomy term hit tracking enabled.
```json
{
  "track.browing.55555" : {
    "url" : "http://www.mysite.com/some-great-page",
    "taxonomy" : {
      "my_category" : {
        "25" : "Term Name",
        "26" : "Another Term"
      }
      "my_types" : {
        "13" : "Some Tag"
      }
    }
  }
}
```

###Favorite Terms
Because we know how many times a person has seem specific tags, we can infer a person's favorite
terms from their browing history. NOTE: Your tracking history storage settings.
```javascript
(function($) {
  $(document).ready(function() {
    Drupal.settings.semi_anonymous.userDeferred = Drupal.settings.semi_anonymous.userDeferred || $.Deferred();
    // Ensure data availability.
    Drupal.settings.semi_anonymous.user_deferred.done(function () {
      var favTerms = Drupal.SemiAnon.getFavoriteTerms();
      doSomeCoolAjaxThing(favTerms.my_category);
    }
  });
})(jQuery);
```

##Custom Tracking
It's recommended that you wait until the use object is available. Here's some same JS code.
```javascript
(function($) {
  $(document).ready(function() {

      // Track your own activities.
      $( ".my-special-links" ).bind( "click", function() {
        myObj.linkText = $(this).text()
        myObj.myProperty = $(this).attr('data-property');
        Drupal.SemiAnon.createActivity = function ('my_activity', myObj);
      });

      // Retrieve them.
      Drupal.SemiAnon.getActivities('my_activity');

  });
})(jQuery);
```

They will be stored, and come back, like this. But filtered down to the group specified.
```json
{
  "track.my_activity.12345" : {
    "linkText" : "Link text from page",
    "myProperty" : "the-property-value"
  }
  "track.my_activity.12999" : {
    "linkText" : "Other link text",
    "myProperty" : "this-property-value"
  }
}
```
