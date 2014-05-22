/**
 * @file
 * Track browsing history or other logging stats.
 */

// Those functions in need of a little jQuery.
(function ($) {

  // Namespace for functions.
  Drupal.SemiAnon = Drupal.SemiAnon || {};

  // Act on the page load.
  Drupal.behaviors.semi_anonymous_tracking = {
    attach: function (context, settings) {
      if (context === document) {

        // Log browsing.
        if (settings.semi_anonymous.track_browsing || settings.semi_anonymous.track_term_hits) {
          var returnVal = {};

          // Log page view.
          if (settings.semi_anonymous.track_browsing) {
            returnVal.url = window.location.href;
          }
          // Log term hits.
          if (settings.semi_anonymous.track_term_hits) {
            returnVal.taxonomy = settings.semi_anonymous_meta.taxonomy;
          }
          // Stash it.
          Drupal.SemiAnon.createActivity('browsing', JSON.stringify(returnVal));
        }

      }
    }
  };

  // Look through browsing history and find user's top terms.
  Drupal.SemiAnon.getFavoriteTerms = function () {
    var results = Drupal.SemiAnon.getActivities('browsing'),
        pages = [], // De-dupe.
        terms = {}; // Return.

    // Walk through tracking records.
    $.each(results, function(i, key) {
      var record = JSON.parse($.jStorage.get(key));
      // Only count once.
      if (typeof pages[record.url] === 'undefined') {
        pages[record.url] = true;
        if (record.hasOwnProperty('taxonomy')) {
          // Walk through vocabs and terms.
          $.each(record.taxonomy, function (vocName, data) {
            $.each(record.taxonomy[vocName], function (tid, val) {
              // Existing, add to count.
              if (terms.hasOwnProperty(tid)) {
                terms[tid].count++;
              }
              else {
                // New, add it on and create count.
                terms[tid] = {vocabulary: vocName, count: 1};
              }
            });
          });
        }

      }
    });

    // @todo Sort and reduce. #3737

    return terms;
  };

  /**
   * Access records of a specific tracking group.
   * 
   * @param {string} group
   *   Name of the tracking group to return values for.
   * return {array}
   *   List of tracking localStorage entries.
   */
  Drupal.SemiAnon.getActivities = function (group) {
    var results = $.jStorage.index();

    if (group) {
      // Remove unwanted types (string beginning assumed).
      for(var i = 0; i < results.length; i++) {
        if (results[i].indexOf('track.' + group) !== 0) {
          results.splice(i, 1);
          i--;
        }
      }
      return results;
    }
    else {
      return results;
    }
  };

  /** Put a tracking record into storage.
   * 
   * @param {string} group
   *   Name of the tracking group to store the data as.
   * @param {string} data
   *   Blob of data to store. Recommended as JSON.stringify(myDataObject).
   */
  // @todo Could allow TTL as an optional parameter.
  Drupal.SemiAnon.createActivity = function (group, data) {
    // Place in storage.
    var n = new Date().getTime();
    // Log event.
    $.jStorage.set('track.' + group + '.' + n, data);
  };

})(jQuery);
