/**
 * @file
 * Track browsing history or other logging stats.
 */

// Functions in need of a little jQuery.
(function ($) {

  // Namespace for functions.
  Drupal.SemiAnon = Drupal.SemiAnon || {};

  // Act on the page load.
  Drupal.behaviors.semi_anonymous_tracking = {
    attach: function (context, settings) {
      if (context === document) {

        // Log browsing.
        if (settings.semi_anonymous.track_browsing) {
          var trackVal = {};

          // Log page view.
          if (settings.semi_anonymous.track_browsing) {
            trackVal.url = window.location.href;
            // Log configured items.
            if (settings.semi_anonymous_tracking) {
              $.each(settings.semi_anonymous_tracking, function (i, val) {
                // Add each item.
                if (typeof settings.semi_anonymous_meta[val] !== undefined) {
                  trackVal[val] = settings.semi_anonymous_meta[val];
                }
              });
            }
            else {
              // Log all meta data.
              $.each(settings.semi_anonymous_meta, function (i, val) {
                trackVal[i] = val;
              });
            }
          }

          // Log term hits.
          if (settings.semi_anonymous.track_term_hits) {
            trackVal.taxonomy = settings.semi_anonymous_meta.taxonomy;
          }

          // Stash it.
          Drupal.SemiAnon.createActivity('browsing', JSON.stringify(trackVal));
        }

      }
    }
  };


  /**
   * Use browsing history and find user's top terms.
   *
   * return {object}
   *   List of vocabs with top taxonomy term and count.
   */
  Drupal.SemiAnon.getFavoriteTerms = function (returnAll) {
    var returnAll = (typeof returnAll === 'undefined') ? false : returnAll,
        results = new Drupal.SemiAnon.Collection(Drupal.SemiAnon.getActivities('browsing')),
        pages = [], // In order to de-dupe.
        returnTerms = {}; // Return.

    // Walk through tracking records.
    $.each(results.get(), function (key, record) {
      // Only count once.
      if (typeof pages[record.url] === 'undefined') {
        // For de-duping URL hits.
        pages[record.url] = true;

        if (record.hasOwnProperty('taxonomy')) {
          // Walk through vocabs.
          for (vocName in record.taxonomy) {
            // Walk through terms.
            for (tid in record.taxonomy[vocName]) {
              // Non-existant vocab.
              if (!returnTerms.hasOwnProperty(vocName)) {
                returnTerms[vocName] = {};
              }

              // Existing term, add to count.
              if (returnTerms[vocName].hasOwnProperty(tid)) {
                returnTerms[vocName][tid].count++;
              }
              else {
                // New, add it on and create count.
                returnTerms[vocName][tid] = { name: record.taxonomy[vocName][tid], count: 1 };
              }
            }
          }

        }
      }
    });

    // Reduce to just top terms per vocab. #3737
    if (!returnAll) {
      var topTerms = {};
      // Walk through vocabs.
      for (vocName in returnTerms) {
        var topCount = 0;

        // Walk through terms, to find top count.
        for (tid in returnTerms[vocName]) {
          // Find top term hit count.
          if (returnTerms[vocName][tid].count > topCount) {
            topCount = returnTerms[vocName][tid].count;
          }
        }
        // Walk through terms, again, to collect top terms.
        for (tid in returnTerms[vocName]) {
          // Find top term hit count.
          if (returnTerms[vocName][tid].count == topCount) {
            if (!topTerms.hasOwnProperty(vocName)) {
              topTerms[vocName] = {};
            }
            topTerms[vocName][tid] = returnTerms[vocName][tid];
          }
        }
      }

      return topTerms;
    }
    else {
      return returnTerms;
    }
  };


  /**
   * Access records of a specific tracking group.
   *
   * @param {string} group
   *   Name of the tracking group to return values for.
   *
   * return {object}
   *   Key/value list of tracking localStorage entries.
   */
  Drupal.SemiAnon.getActivities = function (group) {
    var results = $.jStorage.index(),
        returnVals = {};

    if (group) {
     // Remove unwanted types and return records.
      $.each(results, function (i, val) {
        if (val.indexOf('track.' + group) === 0) {
          returnVals[val] = JSON.parse($.jStorage.get(val));
        }
      });
    }
    else {
      // Collect and return all.
      $.each(results, function (i, val) {
        returnVals[val] = JSON.parse($.jStorage.get(val));
      });
    }

    return returnVals;
  };


  /**
   * Put a tracking record into storage.
   * @todo Could allow TTL as an optional parameter.
   *
   * @param {string} group
   *   Name of the tracking group to store the data as.
   * @param {string} data
   *   Blob of data to store. Recommended as JSON.stringify(myDataObject).
   */
  Drupal.SemiAnon.createActivity = function (group, data) {
    var results = new Drupal.SemiAnon.Collection(Drupal.SemiAnon.getActivities(group)),
        n = new Date().getTime();

    // Log event, first.
    $.jStorage.set('track.' + group + '.' + n, data);

    // Ensure space limit is maintained.
    if (results.size() > Drupal.settings.semi_anonymous.track_browsing_extent) {
      var diff = results.size() - Drupal.settings.semi_anonymous.track_browsing_extent,
          keys = results.keys();

      // Kill off oldest extra tracking activities.
      for (var i=0; i<=diff; i++) {
        $.jStorage.deleteKey(keys[i]);
      }
    }
  };


  /**
   * Utility...
   * (Avoiding depdencies)
   */

  /**
   * Handy object type for record retrieval and use.
   * Namespaced for easy use to extend the module.
   *
   * param {object}
   *   Set of records to gain methods on.
   */
  Drupal.SemiAnon.Collection = function (obj) {
    // Private vars.
    var keys = null,
        length = null;

    // Public functions.
    return {

      /**
       * Get the size of an object.
       *
       * param {object} obj
       *   Oject to be inspected.
       * return {number}
       *   Size of the object.
       */
      size : function () {
        if (length === null) {
          length = 0;
          for (var key in obj) length++;
        }
        return length;
      },

      /**
       * Get the property keys of an object.
       *
       * param {object} obj
       *   Oject to be inspected.
       * return {array}
       *   List of object properties.
       */
      keys : function () {
        if (keys === null) {
          keys = [];
          for (var key in obj) keys.push(key);
        }
        return keys.sort();
      },

      /**
       * Access the object from this instance.
       *
       * return {object}
       *   Use what you started with.
       */
      get : function () {
        return obj;
      }
    }
  };

})(jQuery);
