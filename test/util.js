// NodeJunit common test functions

/**
 * Runs given function by name on the testObject gives testCallback function as parameter on the given position.
 * Other parameters will be set to null.
 * An error is always expected as the first parameter in the callback call from the given function.
 * @param funcName of function to call on testObject.
 * @param callbackParamPos position of parameter that should be a callback.
 * @param test nodeJunit test object received in every test.
 * @param expectedCallbackResult the second parameter 'result' in the callback the given function makes, default is undefined which will equal null and false.
 */
util.prototype.nullTest = function (funcName, callbackParamPos, test, expectedCallbackResult, fixedParameters) {
    // Get the function by name via public means or private using rewire getter, in the latter case the testObject has to be wired
    var func;

    if (this.testObject[funcName]) {
        func = this.testObject[funcName];
    } else {
        if (!this.testObject.__get__) {
            throw new Error(this.name + ' must be wired to access private functions. Or given function name does not exist.');
        }
        func = this.testObject.__get__(funcName);
    }

    var paramAmount = func.length;
    var args = [];

    for (var i = 0; i < paramAmount; i++) {
        if (i == callbackParamPos) {
            args.push(testCallback);
        } else {
            // set any fixed parameters if given
            var param = null;

            if (fixedParameters && fixedParameters[i]) {
                param = fixedParameters[i];
            }
            args.push(param);
        }
    }

    if (!func) {
        test.fail(null, null, 'Function ' + funcName + ' does not exist on ' + this.name);
        test.done();
    } else {
        func.apply(this.testObject, args);
    }

    // Actual test code fired by the given function itself when it does the callback
    function testCallback(error, response) {
        // test.ok(error, 'Expected error in callback as first parameter but got ' + error);
        var msg;

        test.ok(error, 'Expected error in callback as first parameter but got ' + error);

        msg = funcName + ' response: ' + response + ' does not equal expected: ' + expectedCallbackResult;

        if (expectedCallbackResult == undefined && response != undefined) {
            // Reset expected result when ommitted to make it evaluate true on undefined == false
            test.equal(response, false, msg);
        } else {
            test.equal(response, expectedCallbackResult, msg);
        }
        test.done();
    }
};

function util(testObject, name) {
    if (!name) {
        throw new Error('Util requires a name for the testObject');
    }
    this.testObject = testObject;
    this.name = name;
}

module.exports = util;
