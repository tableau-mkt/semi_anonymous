/**
 * @file
 * Use client-side profiling to filter Views content.
 */

// @ Remove Underscore items.


// Insurance.
Drupal.SemiAnon = Drupal.SemiAnon || {};

/**
 * Sniff out client-side Views auto-filters and use their settings to map
 * profiled user values to them and trigger AJAX results. NOTE: Options are set
 * throught the Views UI plugin.
 */
(function($) {
  $(document).ready(function() {

    // Little helper for coding once.
    var triggerFilters = function triggerFilters() {
      // Set each filter.
      $.each(Drupal.SemiAnon.getAutoFilters(), function (i, val) {
        // Avoid acting on hidden things.
        if (val.filter.parents('.view').is(":visible")) {
          // Only show once visible if available.
          if (typeof $.waypoints !== 'undefined') {
            val.filter.parents('.view').waypoint(function() {
              //Drupal.SemiAnon.clientSideFilter($val, index);
            }, { offset:'100%', triggerOnce:true });
          }
          else {
            Drupal.SemiAnon.clientSideFilter(val.filter, val.property);
          }
        }
      });
    };

    /**
     * Trigger configured auto-filters.
     */

    // Confirm existance of filter forms.
    if ($('form').hasClass('semi-anonymous-auto-filter')) {
      // Use the user data.
      Drupal.settings.semi_anonymous.userDeferred.done(function() {
        triggerFilters();
      });
    }

  });

  /**
   * Add analytics to links within auto-filtered recommendations.
   * Needs to happen on AJAX returns.
   */
  Drupal.behaviors.semi_anonymous_link_analysis = {
    attach: function (context, settings) {
      var $content,
          glue,
          pattern;

      // Both page load and AJAX.
      if ((context === document || (context instanceof jQuery && context.is('form'))) && settings.semi_anonymous.auto_filter_link_analysis) {

        $.each(Drupal.SemiAnon.getAutoFilters(), function (i, val) {
          $content = val.filter.closest('.view:visible').find('.view-content');

          $content.find('.views-row a, .view-content li a').each( function() {
            // Add query params if not already present (other on-page AJAX can cause duplication).
            pattern = new RegExp('^filter=' + encodeURIComponent(val.property));
            if ($(this).attr('href').match(pattern) === null) {
                glue = '?';
              if (typeof $(this).attr('href').split('?')[1] !== 'undefined') {
                glue = '&';
              }
              $(this).attr('href',
                $(this).attr('href') + glue + 'filter=' + encodeURIComponent(val.property) + '&val=' + encodeURIComponent(val.filter.find('select option:selected').text())
              );
            }
          });

        });

      }
    }
  };

  /**
   * Helper function to obtain an array of valid filters.
   *
   * @return {array}
   *   List of configured auto-filters on the page.
   */
  Drupal.SemiAnon.getAutoFilters = function() {
    var filters = [],
        $view,
        $filter,
        id,
        display,
        selector;

    // Run all the marked Views forms.
    $('form.semi-anonymous-auto-filter').each(function() {
      $view = $(this).closest('.view');
      // Learn about this View.
      id = Drupal.SemiAnon.getViewProperty($view.attr('class'), 'id');
      display = Drupal.SemiAnon.getViewProperty($view.attr('class'), 'display');

      // Walk through configured filters.
      $.each(Drupal.settings.semi_anonymous.views_filters[id][display], function(index, val) {
        $filter = false;
        // Bit nuts, but filters can live within other views. Found out the hard way.
        selector = 'form#views-exposed-form-' + id.replace(/_/g,'-') + '-' + display.replace(/_/g,'-') + ' .views-widget-filter-' + index;
        $filter = $view.find(selector);

        // Inital confirmation filter exists and mapping setting isn't empty.
        if ($filter && val.data_property !== '') {
          // Add this filter to our list.
          filters.push({
            'filter': $filter,
            'property': val.data_property
          });
        }
      });
    });

    return filters;
  };

  /**
   * Attempt to set a Views exposed filter using a client-side user property and
   * submit a value. Everything else will be handled for you.
   *
   * @param {object} $filter
   *   The jQuery object of a Views filter widget wrapper DOM element.
   *   Does not have to be configured through Views is trigger manually.
   * @param {string} property
   *   The the user object propety to use to set the filter with.
   */
  Drupal.SemiAnon.clientSideFilter = function($filter, property) {
    var favData = Drupal.SemiAnon.getFavoriteTerms(),
        matches = property.match(/^taxonomy:(.+)/), // Look for taxonomy indicator.
        vocab = matches && matches[1], // When truthy grab the value.
        userValue = false,
        favVocabData;

    // Check for taxonomy vocab indicator.
    if (matches) {
      if (favData.hasOwnProperty(vocab)) {
        // Handle mulitple terms due to event count.
        favVocabData = new Drupal.SemiAnon.Collection(favData[vocab]);
        // Honor filter trigger threshold.
        if(favData[vocab][favVocabData.keys()[0]].count >= Drupal.settings.semi_anonymous.auto_filter_threshold) {
          userValue = favData.property;
        }
        else {
          // Exit if under threshold.
          return;
        }
      }
    }
    else {
      userValue = $.jStorage.get(property);
    }

    // Confirm existance of filter and option before using value.
    // @todo Work with text filters.
    if ($filter.length && $filter.find('option[value="' + userValue + '"]').length) {
      $filter.find('select').val(userValue);
      $filter.siblings('.views-submit-button').find('input.form-submit').click();
    }

  };

  /**
   * Handy Views property getter from raw DOM classes.
   *
   * @param {string} class_str
   *   Raw class attribute string from DOM object.
   * @param {string} property
   *   Views property you are interested in (id, display).
   *
   * return {string}
   *   Views property value.
   */
  Drupal.SemiAnon.getViewProperty = function(class_str, property) {
    var classes = class_str.split(' '),
        pattern,
        matched,
        c;

    switch (property) {
      case 'id':
        pattern = new RegExp('^view-id-(.+)');
        break;

      case 'display':
        pattern = new RegExp('^view-display-id-(.+)');
        break;
    }

    for(c in classes) {
      if (matched = classes[c].match(pattern)) {
        return matched[1];
      } 
    }
  };

})(jQuery);
