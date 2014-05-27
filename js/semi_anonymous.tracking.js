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
  Drupal.SemiAnon.getFavoriteTerms = function () {
    var results = Drupal.SemiAnon.getActivities('browsing'),
        pages = [], // De-dupe.
        terms = {}; // Return.

    // Walk through tracking records.
    $.each(results, function(key, record) {
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
   *
   * return {object}
   *   Key/value list of tracking localStorage entries.
   */
  Drupal.SemiAnon.getActivities = function (group) {
    var results = $.jStorage.index(),
        returnVals = {};

    $.each(results, function (i, val) {
      if (group) {
        // Remove unwanted types (string beginning assumed).
        if (i.indexOf('track.' + group) === 0) {
          returnVals[val] = JSON.parse($.jStorage.get(val));
        }
      }
      else {
        returnVals[val] = JSON.parse($.jStorage.get(val));
      }
    });

    return returnVals;
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
