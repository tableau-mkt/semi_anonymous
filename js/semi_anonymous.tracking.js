/**
 * @file
 * Track browsing history or other logging stats.
 */

// Functions in need of a little jQuery.
(function ($) {

  // Namespace.
  window.semiAnon = window.semiAnon || {};
  // Make favorites "static".
  semiAnon.FavoriteTerms = false;

  $(document).ready(function(){

    var trackVals = {
      'url': window.location.href
    };

    // Log only configured items.

    // @todo Use the data-layer-helper for proper extraction of page meta items.

    if (semiAnon.tracking) {
      $.each(semiAnon.tracking, function (i, val) {
        // Add each item.
        if (typeof dataLayer[val] !== undefined) {
          trackVals[val] = dataLayer[val];
        }
      });
    }
    else {
      // Log all meta data.
      trackVals = dataLayer;
    }

    // Log term hits.
    if (semiAnon.track_term_hits) {
      trackVals.taxonomy = dataLayer.taxonomy;
    }

    // Stash it.
    semiAnon.createActivity('browsing', JSON.stringify(trackVals));

  });


  /**
   * Use browsing history and find user's top terms.
   *
   * @param
   * 
   * return {object}
   *   List of vocabs with top taxonomy term and count.
   */
  semiAnon.getFavoriteTerms = function (returnAll) {
    var results = semiAnon.getActivities('browsing'), // Collection not needed.
        pages = [], // In order to de-dupe.
        returnTerms = {}, // Return.
        topTerms = {}; // Top only return.

    // Optional param.
    returnAll = returnAll || false;

    // Only build it once.
    if(!semiAnon.FavoriteTerms) {

      // Walk through tracking records.
      for (var key in results) {
        // Only count once.
        if (typeof pages[results[key].url] === 'undefined' && results[key].hasOwnProperty('taxonomy')) {
          // For de-duping URL hits.
          pages[results[key].url] = true;

          // Walk through vocabs.
          for (var vocName in results[key].taxonomy) {
            // Walk through terms.
            for (var tid in results[key].taxonomy[vocName]) {
              // Non-existant vocab.
              if (!returnTerms.hasOwnProperty(vocName)) {
                returnTerms[vocName] = {};
              }

              // Existing term, add to count.
              if (returnTerms[vocName].hasOwnProperty(tid)) {
                returnTerms[vocName][tid].count++;
              }
              else {
                // New, add it on and create count.
                returnTerms[vocName][tid] = { name: results[key].taxonomy[vocName][tid], count: 1 };
              }
            }
          }

        }
      }

      // Reduce to just top terms per vocab. #3737
      if (!returnAll) {
        // Walk through vocabs.
        for (var vocNameForTop in returnTerms) {
          var topCount = 0;

          // Walk through terms, to find top count.
          for (var tidForCount in returnTerms[vocNameForTop]) {
            // Find top term hit count.
            if (returnTerms[vocNameForTop][tidForCount].count > topCount) {
              topCount = returnTerms[vocNameForTop][tidForCount].count;
            }
          }
          // Walk through terms, again, to collect top terms.
          for (var tidForTop in returnTerms[vocNameForTop]) {
            // Find top term hit count.
            if (returnTerms[vocNameForTop][tidForTop].count === topCount) {
              if (!topTerms.hasOwnProperty(vocNameForTop)) {
                topTerms[vocNameForTop] = {};
              }
              topTerms[vocNameForTop][tidForTop] = returnTerms[vocNameForTop][tidForTop];
            }
          }
        }

        semiAnon.FavoriteTerms = topTerms;
      }
      else {
        semiAnon.FavoriteTerms = returnTerms;
      }

    }

    return semiAnon.FavoriteTerms;
  };


  /**
   * Access records of a specific tracking group.
   *
   * @param {string} group
   *   Name of the tracking group to return values for.
   *
   * return {object}
   *   Key/value list of tracking localStorage entries.
   */
  semiAnon.getActivities = function (group) {
    var results = $.jStorage.index(),
        returnVals = {},
        i = 0;

    if (group) {
      // Remove unwanted types and return records.
      for (i in results) {
        if (results[i].indexOf('track.' + group) === 0) {
          returnVals[results[i]] = JSON.parse($.jStorage.get(results[i]));
        }
      }
    }
    else {
      // Collect and return all.
      for (i in results) {
        returnVals[results[i]] = JSON.parse($.jStorage.get(results[i]));
      }
    }

    return returnVals;
  };


  /**
   * Put a tracking record into storage.
   * @todo Could allow TTL as an optional parameter.
   *
   * @param {string} group
   *   Name of the tracking group to store the data as.
   * @param {string} data
   *   Blob of data to store. Recommended as JSON.stringify(myDataObject).
   */
  semiAnon.createActivity = function (group, data) {
    var results = new semiAnon.Collection(semiAnon.getActivities(group)),
        keys = results.keys(),
        n = new Date().getTime(),
        diff = 0;

    // Log event, first.
    $.jStorage.set('track.' + group + '.' + n, data);

    // Ensure space limit is maintained.
    if (results.size() > semiAnon.track_browsing_extent) {
      diff = results.size() - semiAnon.track_browsing_extent;

      // Kill off oldest extra tracking activities.
      for (var i=0; i<=diff; i++) $.jStorage.deleteKey(keys[i]);
    }
  };


  /**
   * Utility...
   * (Avoiding depdencies)
   */

  /**
   * Handy object type for record retrieval and use.
   * Namespaced for easy use to extend the module.
   *
   * param {object}
   *   Set of records to gain methods on.
   */
  semiAnon.Collection = function (obj) {
    // Private vars.
    var keyList = null,
        length = null;

    // Public functions.
    return {

      /**
       * Get the property keys of an object.
       *
       * param {object} obj
       *   Oject to be inspected.
       * return {array}
       *   List of object properties.
       */
      keys : function() {
        if (keyList === null) {
          keyList = [];
          for (var key in obj) keyList.push(key);
        }
        return keyList.sort();
      },

      /**
       * Get the size of an object.
       *
       * param {object} obj
       *   Oject to be inspected.
       * return {number}
       *   Size of the object.
       */
      size : function () {
        if (obj == null) return 0;
        if (length === null) {
          length = this.keys().length;
        }
        return length;
      },

      /**
       * Access the object from this instance.
       *
       * return {object}
       *   Use what you started with.
       */
      get : function () {
        return obj;
      }
    };
  };

})(jQuery);
