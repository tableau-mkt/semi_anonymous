/**
 * @file
 * Track browsing history or other logging stats.
 */

// Those functions in need of a little jQuery.
(function ($) {

  // Namespace internal functions.
  window.SemiAnon = window.SemiAnon || {};

  // Act on the page load.
  Drupal.behaviors.semi_anonymous_tracking = {
    attach: function (context, settings) {
      if (context == document) {

        // Log browsing.
        if (Drupal.settings.semi_anonymous.track_browsing || Drupal.settings.semi_anonymous.track_term_hits) {
          var return_val = {};

          // Log page view.
          if (Drupal.settings.semi_anonymous.track_browsing) {
            return_val['url'] = window.location.href;
          }
          // Log term hits.
          if (Drupal.settings.semi_anonymous.track_term_hits) {
            return_val['taxonomy'] = Drupal.settings.semi_anonymous_meta.taxonomy
          }
          // Stash it.
          SemiAnon.create_activity('browsing', JSON.stringify(return_val));
        }

      }
    }
  };

  // Look through browsing history and find user's top terms.
  SemiAnon.get_favorite_terms = function() {
    var results = SemiAnon.get_activities('browsing'),
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
          $.each(record.taxonomy, function(voc_name, data) {
            $.each(record.taxonomy[voc_name], function(tid, val) {
              // Existing, add to count.
              if (terms.hasOwnProperty(tid)) {
                terms[tid]['count']++;
              }
              else {
                // New, add it on and create count.
                terms[tid] = {};
                terms[tid]['vocabulary'] = voc_name;
                terms[tid]['count'] = 1;
              }
            });
          });
        }

      }
    });
    
    // @todo Sort and reduce.

    return terms;
  };

  // Access records of a specific tracking group.
  SemiAnon.get_activities = function(group) {
    var results = $.jStorage.index();

    if (group != false) {
      // Remove unwanted types (string beginning assumed).
      for(var i = 0; i < results.length; i++) {
        if (results[i].indexOf('track_' + group) != 0) {
          results.splice(i, 1);
          i--;
        }
      };
      return results;
    }
    else {
      return results;
    }
  };

  // Put things in.
  // @todo Could allow TTL as an optional parameter.
  SemiAnon.create_activity = function(group, data) {
    // Place in storage.
    var n = new Date().getTime();
    // Log event.
    $.jStorage.set('track_' + group + '.' + n, data)
  };

})(jQuery);
