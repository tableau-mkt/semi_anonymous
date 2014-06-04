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

  // Init tests.
  test('Namespace exists', function () {
    expect(2);
    ok(Drupal.SemiAnon, 'Main namespace exists');
    ok((typeof Drupal.SemiAnon === "object"), 'Namespace object is an object');
  });

  test('Storage space exists', function () {
    expect(3);
    ok($.jStorage.storageAvailable(), 'Storage object exists');
    ok((typeof $.jStorage === "object"), 'Storage object is an object');
    ok((typeof $.jStorage.index()), 'Index is available');
  });


  module('Semi Anonymous: User basics');

  test('User origins', function() {
    expect(2);
    var origin = $.jStorage.get('user.origin'),
        session_origin = $.jStorage.get('user.session_origin');

    strictEqual(JSON.parse(origin).url.slice(-19), 'semi_anonymous.html', 'Origin should be test file.');
    strictEqual(JSON.parse(session_origin).url.slice(-19), 'semi_anonymous.html', 'Session origin should be test file.');
  });


  module('Semi Anonymous: Tracking');

  test('Tracking scafolding', function() {
    var functions = [
      'getFavoriteTerms',
      'getActivities',
      'createActivity',
      'Collection'
    ];
    expect(functions.length);

    for (var f in functions) {
      strictEqual(typeof Drupal.SemiAnon[functions[f]], 'function', 'Function exists: ' + functions[f]);
    }
  });

}(jQuery));
