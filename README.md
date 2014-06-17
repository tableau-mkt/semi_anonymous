Semi Anonymous
==============
Profile anonymous users.

* __[Getting started](#getting-started)__
 * [Local storage](#local-storage) - how the data storage works
 * [User data space](#module-provided-user-space) - standardized and guaranteed
 * [Page meta data](#meta-data-output) - available properties
* __[Pageview tracking](#activity-tracking)__
 * [Favorite terms](#favorite-terms) - accessing aggregated profiling
* __[Custom tracking](#custom-tracking)__
 * Stash and retrieve your own activities with ease!
* __[Advanced use](#advanced-use)__

## Getting Started
This Drupal module does several things, which may independently solve your need. It provides in-browser localStorage space, stores a user "origins," and handles stashing of client-side activity data, uses the output of Drupal page meta data.

### Issues
Please post any problems or feature requests to the [Drupal project issue queue](https://drupal.org/project/issues/semi_anonymous).

### Dependencies
First is the Drupal module which exposes the data we need for trakcing. The other two are JavaScript, both of which have a Drupal project if you prefer to register your libraries. Follow *one* of the instructions for those.

1. [Data Layer](https://drupal.org/project/datalayer) client-side data output for Drupal.
 * Place in `sites/all/modules/datalayer`
 * Enable via modules UI or Drush.
 * Configure meta data output via admin: `/admin/config/search/datalayer`
2. [jStorage](http://jstorage.info) localStorage abstraction library.
 * Place in `sites/all/libraries/jstorage/jstorage.min.js`
 * Or use the [Drupal project](https://drupal.org/project/jstorage_lib).
3. [JSON2](https://github.com/douglascrockford/JSON-js) better JSON methods
 * Place in `sites/all/libraries/json2/json2.js`
 * Or use the [Drupal project](https://drupal.org/project/json2).

### Local Storage
This module sets up in-browser key/value localStorage with the convenient jStorage abstraction library.
_See the jStorage site for more info._
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
// Outputs: something = 0.81
```

### Module Provided User Space
To stash a single user property it's **recommended** to use a `user.property` key format. One of the most basic features is just knowing
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
To access user storage, it's **highly recommended** that you ensure the object is available. There can be a
very small amount of time associated with jQuery + jStorage setup, additionally this keeps JS include
order irrelevant which is good for robustness. _This is the only example that includes the full closure._
```javascript
(function ($) {
  Drupal.behaviors.my_module = {
    attach: function (context, settings) {
      if (context === document) {

        // Ensure data availability.
        semiAnon.userDeferred = semiAnon.userDeferred || $.Deferred();

        semiAnon.userDeferred.done(function () {
          // Act on a user property.
          var origin = JSON.parse($.jStorage.get('user.origin'));
          doSomethingNeato(origin.url);

          // Store your own items.
          myObj.thing = 'Some component';
          myObj.another = 'Another component';
          $.jStorage.set('user.thing', JSON.stringify(myObj));

          // Get it on some later page.
          var myVal = JSON.parse($.jStorage.get('user.thing'));
        }

      }
    }
  };
})(jQuery);
```

### Meta Data Output
In order to do fun and fancy things on the client-side you need easy access to the meta data
about the pages of your site. See the [DataLayer GitHub page](https://github.com/tableau-mkt/datalayer) for docs.

## Activity Tracking
A user's browsing history is stored per page view. This is an example record, which includes data from taxonomy term hit tracking being enabled...
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
$.each(semiAnon.getActivities('browsing'), function (key, record) {
  someComparison(record.url);
});
```
If you want to get fancier with your processing, read on to [Advanced Use](#advanced-use).

### Favorite Terms
There's no point in stashing user activity unless you use it. Because we know how many
times a person has seen specific tags, we can infer a person's favorite terms from their
rich browsing history records. _NOTE: A vocabulary can have more than one term returned
if the hit count is the same._ For clarity here's what you get...
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
You might use that data with some kind of on-page AJAX reaction...
```javascript
var favTerms = semiAnon.getFavoriteTerms(),
    onlyOnce = false;

// Ensure a favorite exists for desired vocab.
if (typeof favTerms.my_category != 'undefined') {
  for (var tid in favTerms.my_category) {
    if (!onlyOnce && favTerms.my_category.tid.count > myThreshold) {
      // Use user profiling to react!
      doSomeCoolAjaxThing(tid, termCount);
      onlyOnce = true;
    }
    else break;
  }
}
```
If you want to see ALL terms from pages seen by the user, with a hit count, just pass `true` as a function arg.
```javascript
var allSeenTerms = semiAnon.getFavoriteTerms(true);
```
Results will be extended compared to the above, like this...
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

## Custom Tracking!
You can register your own tracking activities like this...
```javascript
// Track your own activities.
$('.my-special-links').bind('click', function (e) {
  myObj.linkText = $(this).text()
  myObj.myProperty = $(this).attr('data-property');
  semiAnon.createActivity('my_activity', myObj);
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

## Advanced Use
Because records are returned as an object, you can directly access them once retrieved. Example...
```javascript
var myActivities = semiAnon.getActivities('my_activity');

// Iterate and do something neat.
$.each(myActivities, function (key, record) {
  someComparison(record.bundle, record.taxonomy, record.language);
});
```
However, because they're objects simple operations can be annoying to work with, if you don't use
a library like [Underscore](http://underscorejs.org) or [Lo-Dash](http://lodash.com). To avoid any more
dependencies the following class and methods were necessary and are available...
```javascript
var myResults = new semiAnon.Collection(semiAnon.getActivities('my_activity')),
    // Use the keys from this group.
    resultsKeys = myResults.keys(),
    // Use the tracking objects in this group, the same as directly calling the
    // semiAnon.getActivities('my_activity') function.
    resultsObjects = myResults.get();

// Use the number of activities to output almost the same thing you'd get from iterating
// over the semiAnon.getActivities('my_activity') function.
for (var int = 0; i >= myResults.size(); i++) {
  console.log(resultsObjects[resultsKeys[i]]);
}
```
* `keys()` Returns a list of object properties, in this case tracking keys.
* `size()` Returns an int, just like `myArray.length`
* `get()` Returns the object you passed in, incase via function.

## Tests?
This module does not yet have client-side testing implemented. The plan is to use QUnit and Grunt
to run unit testing of all JS functions. There is also some behavioral tests needed to confirm tracking
and activities. This may need phantom. You are welcome to help with all of these efforts :)

## Thanks.
If you've read this far you might have some suggestions. Feel free to send those or make a merge request.
Find something wrong with these docs? Please send that along as well.
