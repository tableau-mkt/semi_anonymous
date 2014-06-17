/**
 * @file
 * User related activity.
 */

(function ($) {

  // Namespace.
  window.semiAnon = window.semiAnon || {};
  // Data availability.
  semiAnon.userDeferred = semiAnon.userDeferred || $.Deferred();

  $(document).ready(function(){

    var n = new Date().getTime(),
        hit = {
          'timestamp': n,
          'url': window.location.href
        };

    // Stash the session entry point.
    if (!$.jStorage.get('user.session_origin') || !document.referrer) {
      $.jStorage.set('user.session_origin', JSON.stringify(hit));
    }

    // Stash the deep origin.
    if (!$.jStorage.get('user.origin')) {
      hit.referrer = document.referrer;
      $.jStorage.set('user.origin', JSON.stringify(hit));
    }

    // Reliable availability.
    semiAnon.userDeferred.resolve();

  });
})(jQuery);
