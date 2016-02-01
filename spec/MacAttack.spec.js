'use strict';

var macaroons = require('node-macaroons');

(function () {
  describe('createMac', function () {
    var MacAttack = require("../lib/macattack");

    var secret = "my secret";

    var arrayObjectLengthMac          = MacAttack.createMacWithSchema("http://macattack.com", 8080, secret, "(([{\"a\": num}...]) -> num)");
    var numGetterMac                  = MacAttack.createMacWithSchema("http://macattack.com", 8080, secret, "(({}) -> num)");
    var numGetterConsumerMac          = MacAttack.createMacWithSchema("http://macattack.com", 8080, secret, "(({\"a\": num, \"b\": (({}) -> num)}) -> num)");
    var stringGetterNotConsumerMac    = MacAttack.createMacWithSchema("http://macattack.com", 8080, secret, "(({\"a\": num, \"b\": (({}) -> str)}) -> num)");
    var numGetterReturningMac         = MacAttack.createMacWithSchema("http://macattack.com", 8080, secret, "(({}) -> (({}) -> num))");
    var stringGetterReturningMac      = MacAttack.createMacWithSchema("http://macattack.com", 8080, secret, "(({}) -> (({}) -> str))");
    var numGetterReturningConsumerMac = MacAttack.createMacWithSchema("http://macattack.com", 8080, secret, "(({\"a\": num, \"b\": (({}) -> (({}) -> num))}) -> num)");

    beforeEach(function() {});

    it('should create the same macaroon when schema is added', function (){
      var mac = MacAttack.createMac("http://macattack.com", 8080, secret);
      var addedSchemaSerializedMac = macaroons.serialize(MacAttack.addSchema(mac, "(([{\"a\": num}...]) -> num)"));
      var actualSerializedMac = macaroons.serialize(MacAttack.createMacWithSchema("http://macattack.com", 8080, "my secret", "(([{\"a\": num}...]) -> num)"));

      expect(actualSerializedMac).toEqual(addedSchemaSerializedMac);
    });

    it('should validate arguments and returns', function () {
      var validator = MacAttack.validateMacFunction(macaroons.newVerifier(arrayObjectLengthMac), [{a: 1}, {a: 2}, {a: 3}], function (arrayObjs) { return arrayObjs.length; });
      expect(validator.secret(secret).isVerified()).toBe(true);
    });

    it('should validate only arguments', function () {
      var validator = MacAttack.validateMac(macaroons.newVerifier(arrayObjectLengthMac), [{a: 1}, {a: 2}, {a: 3}]);
      expect(validator.secret(secret).isVerified()).toBe(true);
    });

    it('should validate to true if proper mac is in signature', function () {
      var validator = MacAttack.validateMac(macaroons.newVerifier(numGetterConsumerMac), {a: 1, b: macaroons.serialize(numGetterMac)});
      expect(validator.secret(secret).isVerified()).toBe(true);
      //
    });

    it('should not validate to true if wrong signature mac is in signature', function () {
      var validator = MacAttack.validateMac(macaroons.newVerifier(stringGetterNotConsumerMac), {a: 1, b: macaroons.serialize(numGetterMac)});
      expect(validator.secret(secret).isVerified()).toBe(false);
    });
      
    it('should check valid signatures of macaroons in request json', function () {
      var validator = MacAttack.validateMac(macaroons.newVerifier(numGetterReturningConsumerMac), {a: 1, b: macaroons.serialize(numGetterReturningMac)});
      expect(validator.secret(secret).isVerified()).toBe(true);
      //
    });

    it('should check invalid signatures of macaroons in request json', function () {
      var validator = MacAttack.validateMac(macaroons.newVerifier(numGetterReturningConsumerMac), {a: 1, b: macaroons.serialize(stringGetterReturningMac)});
      expect(validator.secret(secret).isVerified()).toBe(false);
    });

    it('should throw error if mac signature is not contructed correctly', function () {
      var throwing = function() {
        MacAttack.createMacWithSchema("http://macattack.com", "(([{\"a\": num}...]) -> num");
      };
      
      expect(throwing).toThrow();
    });
  });
})();