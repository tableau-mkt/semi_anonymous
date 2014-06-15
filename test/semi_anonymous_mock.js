/**
 * @file
 * Fakes environment variables, settings found within Drupal.
 */

window.Drupal = {
  "behaviors": {},
  "settings": {
    "semi_anonymous": {
      "track_term_hits": true,
      "userDeferred": false
    },
    "dataLayer": {
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
