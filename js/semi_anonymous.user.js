/**
 * @file
 * Global user related activity.
 */

(function ($) {
  // Act on the page load.
  Drupal.behaviors.semi_anonymous_user = {
    attach: function (context) {
      if (context == document) {

        // Stash the session entry point.
        if (!$.jStorage.get('user.origin') || !document.referrer) {
          var n = new Date().getTime();
          $.jStorage.set(
            'user.session_origin',
            '{ "timestamp" : "' + n + '", ' +
              '"url" : "' + window.location.href + '" }'
          );
        }

        // Stash the deep origin.
        if (!$.jStorage.get('user.origin')) {
          var n = new Date().getTime();
          $.jStorage.set(
            'user.origin',
            '{ "timestamp" : "' + n + '", ' +
              '"url" : "' + window.location.href + '", ' +
              '"referrer" : "' + document.referrer + '"}'
          );
        }

      }
    }
  };

})(jQuery);
