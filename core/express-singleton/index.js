/**
 * Created by bi on 8/12/15.
 */

var Singleton = function () {
  var instance = {};

  function getInstance(key) {
    return instance[key] || null;
  }

  return {
    get: function (key) {
      return getInstance(key);
    },
    set: function (key, value) {
      if (!instance[key])
        instance[key] = value;
    },
    reset: function (key, value) {
      instance[key] = value;
    }
  };
}();

module.exports = Singleton;
