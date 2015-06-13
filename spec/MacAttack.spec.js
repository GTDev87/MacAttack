'use strict';

(function () {
    describe('createMac', function () {
    	var MacAttack = require("../lib/macattack");

    	var arrayObjectLengthMac 					= MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(([{\"a\": num}...]) -> num)");
    	var numGetterMac         					= MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({}) -> num)");
    	var numGetterConsumerMac 					= MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({\"a\": num, \"b\": (({}) -> num)}) -> num)");
    	var stringGetterNotConsumerMac 		= MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({\"a\": num, \"b\": (({}) -> str)}) -> num)");
    	var numGetterReturningMac       	= MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({}) -> (({}) -> num))");
	    var stringGetterReturningMac    	= MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({}) -> (({}) -> str))");
	    var numGetterReturningConsumerMac = MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(({\"a\": num, \"b\": (({}) -> (({}) -> num))}) -> num)");

	    beforeEach(function() {});

      it('should validate arguments and returns', function () {
				var valid = MacAttack.validateMacFunction(arrayObjectLengthMac, "my secret", "/api/length", "GET", [{a: 1}, {a: 2}, {a: 3}], function (arrayObjs) { return arrayObjs.length; });
				expect(valid).toBe(true);
			});

			it('should validate only arguments', function () {
				var valid = MacAttack.validateMac(arrayObjectLengthMac, "my secret", "/api/length", "GET", [{a: 1}, {a: 2}, {a: 3}]);
				expect(valid).toBe(true);
			});

			it('should validate to true if proper mac is in signature', function () {
				var valid = MacAttack.validateMac(numGetterConsumerMac, "my secret", "/api/length", "GET", {a: 1, b: numGetterMac});
				expect(valid).toBe(true);
			});

			it('should not validate to true if wrong signature mac is in signature', function () {
				var valid = MacAttack.validateMac(stringGetterNotConsumerMac, "my secret", "/api/length", "GET", {a: 1, b: numGetterMac});
				expect(valid).toBe(false);

			});
				
			it('should check valid signatures of macaroons in request json', function () {
				var valid = MacAttack.validateMac(numGetterReturningConsumerMac, "my secret", "/api/length", "GET", {a: 1, b: numGetterReturningMac});
				expect(valid).toBe(true);
			});

			it('should check invalid signatures of macaroons in request json', function () {
				var valid = MacAttack.validateMac(numGetterReturningConsumerMac, "my secret", "/api/length", "GET", {a: 1, b: stringGetterReturningMac});
				expect(valid).toBe(false);
			});

			it('should throw error if mac signature is not contructed correctly', function () {
				var throwing = function() {
	      	MacAttack.createMac("http://macattack.com", "my secret", "/api/length", "GET", "(([{\"a\": num}...]) -> num");
		    };
		    
		    expect(throwing).toThrow();
	    });
		});
})();