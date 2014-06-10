(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#semi_anonymous', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });


  module('Semi Anonymous: Basics');

  test('Init tests', 5, function () {
    ok($.jStorage.storageAvailable(), 'Storage object exists');
    ok((typeof $.jStorage === "object"), 'Storage object is an object');
    ok((typeof $.jStorage.index()), 'Index is available');
    ok(Drupal.SemiAnon, 'Main namespace exists');
    ok((typeof Drupal.SemiAnon === "object"), 'Namespace object is an object');
  });

  test('Collection class works', 3, function () {
    var testObj = {
      'thing': 'blah',
      'another': 5,
      'final': 'yup'
    },
    testAry = ['thing', 'another', 'final'],
    stuff = new Drupal.SemiAnon.Collection(testObj);

    ok(
      stuff.size() === 3,
      'Collection size function reports correctly'
    );
    deepEqual(
      stuff.keys(),
      testAry.sort(),
      'Collection keys function reports correctly'
    );
    deepEqual(
      stuff.get(),
      testObj,
      'Collection getter return correctly'
    );
  });


  module('Semi Anonymous: User basics');

  test('User origins', 3, function() {
    var origin = $.jStorage.get('user.origin'),
        session_origin = $.jStorage.get('user.session_origin');

    // @todo Could perform param slice first or parse the URL for real.
    strictEqual(
      JSON.parse(origin).url.split('?')[0].slice(-19),
      'semi_anonymous.html',
      'Origin should be test file.'
    );
    strictEqual(
      JSON.parse(session_origin).url.split('?')[0].slice(-19),
      'semi_anonymous.html',
      'Session origin should be test file.'
    );
    strictEqual(
      typeof Drupal.settings.semi_anonymous.userDeferred.resolve,
      'function',
      'UserDeferred is a deferred object'
    );
  });


  module('Semi Anonymous: Tracking');

  test('Tracking scafolding present', function() {
    var functions = [
      'getFavoriteTerms',
      'getActivities',
      'createActivity',
      'Collection'
    ];
    expect(functions.length);

    for (var f in functions) {
      strictEqual(
        typeof Drupal.SemiAnon[functions[f]],
        'function',
        'Function exists: ' + functions[f]
      );
    }
  });

  test('Tracking activities work', 3, function() {
    var myResults = new Drupal.SemiAnon.Collection(Drupal.SemiAnon.getActivities('browsing'));

    ok(
      myResults.size() === 1,
      'Page load activity recorded'
    );
    strictEqual(
      myResults.get()[myResults.keys()[0]].url.split('?')[0].slice(-19),
      'semi_anonymous.html',
      'Recorded url is present and correct'
    );

    // Manually create another browsing record.
    Drupal.behaviors.semi_anonymous_tracking.attach(window.document, Drupal.settings);
    myResults = new Drupal.SemiAnon.Collection(Drupal.SemiAnon.getActivities('browsing'));

    ok(
      myResults.size() === 2,
      'Second activity recorded'
    );
  });

  test('Favorites available', 2, function () {
    var favData = new Drupal.SemiAnon.Collection(Drupal.SemiAnon.getFavoriteTerms()),
        termFavData = new Drupal.SemiAnon.Collection(favData.get()[favData.keys()[0]]),
        favTestList = [ "my_types", "special_category" ];

    deepEqual(
      favData.keys(),
      favTestList,
      'Vocabs listed within favorites'
    );
    ok(
      typeof termFavData.get()[termFavData.keys()[0]].count === 'number',
      'Count present on at least first favorite term'
    );
  });


  module('Views auto-filter');

  test('Filters utilities', 3, function () {
    var $block = $('#block-views-my-view-block-1');

    strictEqual(
      Drupal.SemiAnon.getViewProperty($block.find('.view').attr('class'), 'id'),
      'my_view',
      'View name returned correctly'
    );
    strictEqual(
      Drupal.SemiAnon.getViewProperty($block.find('.view').attr('class'), 'display'),
      'block_1',
      'View display returned correctly'
    );
    ok(
      Drupal.SemiAnon.getAutoFilters()[0].filter instanceof $,
      'Filter list contains at least one jQuery DOM object'
    );
  });

  test('Link analysis', 2, function() {
    var query = $('#block-views-my-view-block-1').find('.view-content a').first().attr('href').split('?')[1];

    ok(
       query.split('&')[0] === 'filter=taxonomy%3Aspecial_category',
      'Analysis filter param added to at least first link'
    );
    ok(
      query.split('&')[1] === 'val=The%20one',
      'Analysis value param added to at least first link'
    );
  });

}(jQuery));
