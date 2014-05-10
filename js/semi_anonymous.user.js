/**
 * @file
 * Global user related items activity.
 */

(function ($) {
    $(document).ready(function () {

        // Stash the deep origin.
        if (!$.jStorage.get('user.origin')) {
            var n = new Date().getTime();
            $.jStorage.set('user.origin', n + '|' + uri);
        }

        // Stash the session origin.
        if (!window.referrer) {
            var n = new Date().getTime();
            $.jStorage.set('user.session_origin', n + '|' + uri);
        }

    });
})(jQuery);
