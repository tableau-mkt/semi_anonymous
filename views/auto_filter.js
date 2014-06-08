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
      $.each(Drupal.SemiAnon.getAutoFilters(), function(index, $val) {
        // Avoid acting on hidden things.
        if ($val.parents('.view').is(":visible")) {
          // Only show once visible if available.
          if (typeof $.waypoints !== 'undefined') {
            $val.parents('.view').waypoint(function() {
              Drupal.SemiAnon.clientSideFilter($val, index);
            }, { offset:'100%', triggerOnce:true });
          }
          else {
            Drupal.SemiAnon.clientSideFilter($val, index);
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

      // Both page load and AJAX.
      if ((context === document || (context instanceof jQuery && context.is('form'))) && settings.semi_anonymous.auto_filter_link_analysis) {

        $.each(Drupal.SemiAnon.getAutoFilters(), function(index, $val) {
          var $view = $val.closest('.view:visible'),
              $content = $view.find('.view-content');

          $content.find('.views-row a, .view-content li a').each( function() {
            // Add query params if not already present (AJAX can cause duplication).
            if (typeof $(this).attr('href').split('filter=')[1] === 'undefined') {
              var glue = '?';
              if (typeof $(this).attr('href').split('?')[1] !== 'undefined') {
                glue = '&';
              }
              $(this).attr('href',
                $(this).attr('href') + glue + 'filter=' + index + '&val=' + $val.find('select option:selected').text()
              );
            }
          });

        });

      }
    }
  };


  /**
   * Helper function to find valid filters.
   *
   * @return {array}
   *   List of configured auto-filters on the page.
   */
  Drupal.SemiAnon.getAutoFilters = function() {
    var filters = {};
    // Run all the marked Views forms.
    $('form.semi-anonymous-auto-filter').each(function() {
      var $view = $(this).closest('.view'),
          // Learn about this View.
          id = Drupal.SemiAnon.getViewProperty($view.attr('class'), 'id'),
          display = Drupal.SemiAnon.getViewProperty($view.attr('class'), 'display');

      $.each(Drupal.settings.semi_anonymous.views_filters[id][display], function(index, val) {
        // Bit nuts, but filters can live within other views. Found out the hard way.
        var selector = 'form#views-exposed-form-' + id.replace(/_/g,'-') + '-' + display.replace(/_/g,'-') + ' .views-widget-filter-' + index,
            $filter = $view.find(selector);

        // Inital confirmation filter exists and mapping setting isn't empty.
        if ($filter.length && val.data_property !== '') {
          filters[val.data_property] = $filter;
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
    var onlyOnce = false,
        favData = Drupal.SemiAnon.getFavoriteTerms(),
        matches = property.match(/^taxonomy:(.+)/), // Look for taxonomy indicator.
        vocab = matches && matches[1], // When truthy grab the value.
        userValue,
        tid;

    // Check for taxonomy vocab indicator.
    if (matches) {
      // Honor filter trigger threshold.
      if (favData.hasOwnProperty(vocab) && (favData.vocab.count >= Drupal.settings.semi_anonymous.auto_filter_threshold)) {
        // Handle mulitple terms due to event count.
        // Pop the first poperty of the object.
        // @todo Try using .pop() instead.
        for (tid in favData.vocab) {
          if (!onlyOnce) {
            userValue = favData.property;
            onlyOnce = true;
          }
          else {
            break; 
          }
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
    var ID_PREFIX = 'view-id-',
        DISPLAY_PREFIX = 'view-display-id-',
        classes = class_str.split(' '),
        return_val = false,
        id_class = false,
        display_class = false;

    switch (property) {
      case 'id':
        id_class = $.map(classes, function(c) {
          return c.substr(0, ID_PREFIX.length) === ID_PREFIX;
        });
        if (id_class) {
          return_val = id_class.substr(ID_PREFIX.length);
        }
        break;

      case 'display':
        display_class = $.map(classes, function(d) {
          return d.substr(0, DISPLAY_PREFIX.length) === DISPLAY_PREFIX;
        });
        if (display_class) {
          return_val = display_class.substr(DISPLAY_PREFIX.length);
        }
        break;

      default:
        break;
    }

    return return_val;
  };

})(jQuery);
