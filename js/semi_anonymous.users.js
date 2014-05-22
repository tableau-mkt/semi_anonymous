/**
 * @file
 * Global user related activity.
 */

(function ($) {

  // Act on the page load.
  Drupal.behaviors.semi_anonymous_user = {
    attach: function (context) {
      if (context == document) {

        // Init.
        var n = new Date().getTime(),
            hit = {};

        // Data availability.
        Drupal.settings.semi_anonymous.userDeferred = Drupal.settings.semi_anonymous.userDeferred || $.Deferred();

        // Stash the session entry point.
        if (!$.jStorage.get('user.session_origin') || !document.referrer) {
          hit.timestamp = n;
          hit.url = window.location.href;
          $.jStorage.set('user.session_origin', JSON.stringify(hit));
        }

        // Stash the deep origin.
        if (!$.jStorage.get('user.origin')) {
          hit.timestamp = n;
          hit.url = window.location.href;
          hit.referrer = document.referrer;
          $.jStorage.set('user.origin', JSON.stringify(hit));
        }

        // Reliable availability.
        Drupal.settings.semi_anonymous.userDeferred.resolve();

      }
    }
  }

})(jQuery);
