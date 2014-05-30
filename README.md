Semi Anonymous
==============

Track in order to react to anonymous user behavior. This Drupal module provides localStorage space,
outputs meta data, stores user origins, and handles stashing of client-side activity data.

* __[LocalStorage](#local-storage)__ - get started
 * [User data space](#module-provided-user-space) - standardized and guaranteed
 * [Page meta data](#meta-data-output) - available properties
* __[Pageview tracking](#activity-tracking)__ - browsing history storage
 * [Favorite terms](#favorite-terms) - accessing aggregated profiling
* __[Custom tracking!](#custom-tracking)__ - stash your own activities
* __[Advanced Use](#advanced-use)__ - advanced activity access

##Local Storage
This module sets up the key/value jStorage localStorage abstraction library, which is super easy to use.
See the jStorage site for more info: [jstorage.info](http://www.jstorage.info).
```javascript
// Set a value on one page.
$.jStorage.set('myThing', 'neato');

// Get it on some later page.
var myVal = $.jStorage.get('myThing');
```

For ease of use you should stash data in JSON format, duh.
```javascript
var myObj = {},
    myObj.thing = 'something',
    myObj.cost = 3;
    myObj.percent = 27;
$.jStorage.set('mySave', JSON.stringify(myObj));

// Later access and use.
var myVal = JSON.parse($.jStorage.get('mySave'));
alert(myVal.thing + ' = ' + (myObj.cost * myObj.percent * .01));
// Output 'something = 0.81'
```

###Module Provided User Space
To stash a single user property it's recommended to use a `user.property` key format. One of the most basic features is just knowing
where a user came from. Find that info organized like this...
```json
{
  "user.origin" : {
    "url" : "http://www.mysite.com/some-great-page?param=value",
    "timestamp" : "398649600",
    "referrer" : "http://www.anothersite.com/their-linking-page"
  },
  "user.session_origin" : {
    "url" : "http://www.mysite.com/recent-entry-point",
    "timestamp" : "398649999"
  }
}
```

To access user storage, it's recommended that you wait until the object is available. There can be a
very small amount of time associated with jQuery + jStorage setup, additionally this keeps JS include
order irrelevant which is good for robustness.
```javascript
(function ($) {
  $(document).ready(function() {
    // Ensure data availability. Rebuild/reuse/
    Drupal.settings.semi_anonymous.userDeferred = Drupal.settings.semi_anonymous.userDeferred || $.Deferred();
    Drupal.settings.semi_anonymous.userDeferred.done(function () {

      // Grab the user property.
      var origin = JSON.parse($.jStorage.get('user.origin'));
      alert(origin.url);

      // Store your own items.
      myObj.thingComponent = 'Some component';
      myObj.anotherComponent = 'Another component';
      $.jStorage.set('user.thing', JSON.stringify(myObj));

      // Get it on some later page.
      var myVal = JSON.parse($.jStorage.get('user.thing'));
    }
  });
})(jQuery);
```

###Meta Data Output
In order to do fun and fancy things on the client-side it's nice to have easy access to the meta data
about the pages of our site. This module helps with that. Yes, you could get at this from the DOM, but it's good to be sure.
You can pipe out whatever data you want in a custom module by implementing the
`hook_semi_anonymous_output_properties()` or `hook_semi_anonymous_meta_alter()` functions.
Here's _some_ of what's available by default.
```json
{
  "nid" : "123",
  "title" : "My Cool Page",
  "entityType" : "node",
  "bundle" : "article",
  "uid" : "555",
  "language" : "en",
  "taxonomy" : {
    "special_category" : {
      "25" : "Term Name",
      "26" : "Another Term"
    },
    "my_types" : {
      "13" : "Some Tag",
      "14" : "Another Tag"
    }
  }
}
```

Grab a hold of these available goodies.
```javascript
var pageAuthorUID = Drupal.settings.semi_anonymous_meta.uid,
    pageTitle = Drupal.settings.semi_anonymous_meta.title,
    pageLanguage = Drupal.settings.semi_anonymous_meta.language;

if (typeof Drupal.settings.semi_anonymous_meta.taxonomy.my_category !== 'undefined') {
  var pageHasSomeTerm = Drupal.settings.semi_anonymous_meta.taxonomy.my_category.hasOwnProperty('25');
}
```

##Activity Tracking
A user's browsing history is stored per page view. This is an example record which includes taxonomy term hit tracking enabled.
```json
{
  "track.browsing.398649600" : {
    "url" : "http://www.mysite.com/some-great-page",
    "taxonomy" : {
      "my_category" : {
        "25" : "Term Name",
        "26" : "Another Term"
      },
      "my_types" : {
        "13" : "Some Tag"
      }
    }
  }
}
```

Grab a hold of browsing history and work with it like this...
```javascript
$.each(Drupal.SemiAnon.getActivities('browsing'), function (key, record) {
  someComparison(record.url);
});
```
If you want to get fancier with your processing, read on to [Advanced Use](#advanced-use).

###Favorite Terms
There's no point in stashing user activity unless you use it. Because we know how many
times a person has seen specific tags, we can infer a person's favorite terms from their
rich browsing history records. _NOTE: A vocabulary can have more than one term returned
if the hit count is the same._
```javascript
var favTerms = Drupal.SemiAnon.getFavoriteTerms(),
    onlyOnce = false;

// Ensure a favorite exists for desired vocab.
if (typeof favTerms.my_category != 'undefined') {
  for (tid in favTerms.my_category) {
    if (!onlyOnce && favTerms.my_category.tid.count > myThreshold) {
      // Use user profiling to react!
      doSomeCoolAjaxThing(tid, termCount);
    }
  }
}
```
You'll get a return like this...
```json
{
  "my_category" : {
    "123" : {
      "count" : 5,
      "name" : "My Term"
    },
  },
  "my_types" : {
    "555" : {
      "count" : 7,
      "name" : "My Type"
    },
  },
}
```

If you want to see ALL terms from pages seen by the user, with a hit count, just pass `true` as a function arg.
```javascript
var allSeenTerms = Drupal.SemiAnon.getFavoriteTerms(true);
```
Reults will be extended compared to the above, like this...
```json
{
  "my_category" : {
    "123" : {
      "count" : 5,
      "name" : "My Term"
    },
    "456" : {
      "count" : 2,
      "name" : "My Other Term"
    },
  },
  "my_types" : {
    "555" : {
      "count" : 7,
      "name" : "My Type"
    },
    "999" : {
      "count" : 1,
      "name" : "Another Type"
    },
  },
}
```

##Custom Tracking!
You can register our own tracking activities like this...
```javascript
// Track your own activities.
$('.my-special-links').bind('click', function (e) {
  myObj.linkText = $(this).text()
  myObj.myProperty = $(this).attr('data-property');
  Drupal.SemiAnon.createActivity('my_activity', myObj);
});
```

They will be stored and come back like this; filtered down to the group specified.
```json
{
  "track.my_activity.398649600" : {
    "linkText" : "Link text from page",
    "myProperty" : "the-property-value"
  },
  "track.my_activity.398649999" : {
    "linkText" : "Other link text",
    "myProperty" : "this-property-value"
  }
}
```

##Advanced Use
Because records are returned as an object, you can directly access them once retrieved.
```javascript
var myActivities = Drupal.SemiAnon.getActivities('my_activity');

// Iterate and do something neat.
$.each(myActivities, function (key, record) {
  someComparison(record.bundle, record.taxonomy, record.language);
});
```
However, because they're objects simple operations can be annoying to work with if you don't use
a library like [Underscore](http://underscorejs.org) or [Lo-Dash](http://lodash.com). To avoid any more
dependencies the following class and methods are available...
```javascript
var myResults = new Drupal.SemiAnon.Collection(Drupal.SemiAnon.getActivities('my_activity')),
    // Use the keys from this group.
    resultsKeys = myResults.keys(),
    // Use the tracking objects in this group, the same as directly calling the
    // Drupal.SemiAnon.getActivities('my_activity') function.
    resultsObjects = myResults.get();

// Use the number of activities to output almost the same thing you'd get from iterating
// over the Drupal.SemiAnon.getActivities('my_activity') function.
for (int = 0; i >= myResults.size(); i++) {
  console.log(resultsObjects[resultsKeys[i]]);
}
```
## Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along.
