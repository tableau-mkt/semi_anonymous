/**
 * @file
 * Fakes environment variables, settings found within Drupal.
 */

(function($) {

  // Clear out past tests, unless explicitly not.
  if (!location.href.match(/\?noflush\=|&noflush\=/)) {
    $.jStorage.flush();
  }

})(jQuery);

window.Drupal = {
  "behaviors": {},
  "settings": {
    "semi_anonymous": {
      "track_term_hits": true,
      "userDeferred": false,
      "auto_filter_link_analysis": true,
      "auto_filter_threshold": 2,
      "views_filters": {
        "my_view": {
          "block_1": {
            "my_filter": {
              "data_property": "special_category",
              "hidden": false
            },
            "another_filter": {
              "data_property": "my_types",
              "hidden": false
            }
          }
        }
      }
    },
    "semi_anonymous_meta": {
      "nid": "123",
      "title": "My Cool Page",
      "entityType": "node",
      "bundle": "article",
      "uid": "555",
      "language": "en",
      "taxonomy": {
        "special_category": {
          "25": "Term Name",
          "26": "Another Term"
        },
        "my_types": {
          "13": "Some Tag",
          "14": "Another Tag"
        }
      }
    }
  }
};
