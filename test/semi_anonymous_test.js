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

  test('Init tests', 3, function () {
    ok($.jStorage.storageAvailable(), 'Storage object exists');
    ok((typeof $.jStorage === "object"), 'Storage object is an object');
    ok((typeof $.jStorage.index()), 'Index is available');
  });

  test('Namespaces created', 2, function () {
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

  test('User origins', 2, function() {
    var origin = $.jStorage.get('user.origin'),
        session_origin = $.jStorage.get('user.session_origin');

    strictEqual(
      JSON.parse(origin).url.slice(-19),
      'semi_anonymous.html',
      'Origin should be test file.'
    );
    strictEqual(
      JSON.parse(session_origin).url.slice(-19),
      'semi_anonymous.html',
      'Session origin should be test file.'
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
      myResults.get()[myResults.keys().pop()].url.slice(-19),
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

}(jQuery));
