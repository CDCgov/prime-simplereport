const fs = require('fs');

exports.assertion = function(filename) {
  this.message = `Expected file ${
    this.negate ? 'to not exist: ' : 'to exist: '
  }${filename}`;

  this.expected = function() {
    return this.negate ? false : true;
  };

  this.pass = function(value) {
    return value === true;
  };

  this.value = function(result) {
    return result.value;
  };

  this.command = function(callback) {
    setTimeout(function() {
      const value = fs.existsSync(`/app/downloads/${filename}`);
      // The object containing a "value" property will be passed to the .value() method to determine the value
      // which is to be evaluated (by the .evaluate() method)
      callback({ value });
    }, 500);
    return this;
  };
};
