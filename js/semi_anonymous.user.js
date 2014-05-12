/**
 * @file
 * Global user related activity.
 */

(function ($) {
  // Act on the page load.
  Drupal.behaviors.semi_anonymous_user = {
    attach: function (context) {
      if (context == document) {

console.log('HAPPENING');

        // Stash the deep origin.
        if (!$.jStorage.get('user.origin')) {
          var n = new Date().getTime();
          $.jStorage.set('user.origin', n + '|' + window.location.href);
        }
    
        // Stash the session entry point.
        if (!document.referrer) {
          var n = new Date().getTime();
          $.jStorage.set('user.session_origin', n + '|' + window.location.href);
        }

      }
    }
  };

})(jQuery);
