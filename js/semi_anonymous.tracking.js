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

        // Log page visit.
        if (Drupal.settings.semi_anonymous.track_browsing) {
          SemiAnon.create_activity('page', window.location.href);
        }

        // Log term hit.
        if (Drupal.settings.semi_anonymous.track_term_hits) {
          $each(Drupal.settings.semi_anonymous.taxonomy, function () {
            SemiAnon.create_activity('term', $(this));
          });
        }

      }
    }
  };

  // Access records of group, which are counted and grouped by distict values.
  SemiAnon.get_activities_distinct_grouped_count = function(group, distinct) {
    var results = semi_anon.get_activities(group);

    $.each($.jStorage.index(), function(key, r) {
      // Provide the count.
      var value = $.jStorage.get(key);
      if (value == distinct) {
        results[r].count++;
      }
    });
    return results;
  };

  // Access records of a specific group.
  SemiAnon.get_activities = function(group) {
    var results = $.jStorage.index();
    if (group != false) {
      $.each(results, function (i, r) {
        // Remove unwanted types.
        if (!r.indexOf(group)) {
          results.splice(i, 0);
        }
      });
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
