/**
 * @file
 * Fakes environment variables and settings found within a Drupal install.
 */

window.dataLayer = [{
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
}];

window.semiAnon = {
  "tracking": true,
  "track_term_hits": true,
  "track_browsing_extent": 25
};
