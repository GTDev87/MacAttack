'use strict';

var MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier;

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
      var addedSchemaSerializedMac = MacAttack.addSchema(mac, "(([{\"a\": num}...]) -> num)").serialize();
      var actualSerializedMac = MacAttack.createMacWithSchema("http://macattack.com", 8080, "my secret", "(([{\"a\": num}...]) -> num)").serialize();

      expect(actualSerializedMac).toEqual(addedSchemaSerializedMac);
    });

    // function createMac(ip, port, databaseSecret)
    // function createMacWithSchema(ip, port, databaseSecret, schema)
    // function addSchema(serializedMac, schema)
    // function validateMacFunction(mac, requestData, apiquery, macVerify)
    // function validateMac(mac, requestData, macVerify)
    // function validateMacWithChannel(mac, requestData, macVerify)

    it('should validate arguments and returns', function () {
      var validator = MacAttack.validateMacFunction(arrayObjectLengthMac, [{a: 1}, {a: 2}, {a: 3}], function (arrayObjs) { return arrayObjs.length; });
      expect(validator.isValid(secret)).toBe(true);
    });

    it('should validate only arguments', function () {
      var validator = MacAttack.validateMac(arrayObjectLengthMac, [{a: 1}, {a: 2}, {a: 3}]);
      expect(validator.isValid(secret)).toBe(true);
    });

    it('should validate to true if proper mac is in signature', function () {
      var validator = MacAttack.validateMac(numGetterConsumerMac, {a: 1, b: numGetterMac.serialize()});
      expect(validator.isValid(secret)).toBe(true);
    });

    it('should not validate to true if wrong signature mac is in signature', function () {
      var validator = MacAttack.validateMac(stringGetterNotConsumerMac, {a: 1, b: numGetterMac.serialize()});
      expect(validator.isValid(secret)).toBe(false);
    });
      
    it('should check valid signatures of macaroons in request json', function () {
      var validator = MacAttack.validateMac(numGetterReturningConsumerMac, {a: 1, b: numGetterReturningMac.serialize()});
      expect(validator.isValid(secret)).toBe(true);
    });

    it('should check invalid signatures of macaroons in request json', function () {
      var validator = MacAttack.validateMac(numGetterReturningConsumerMac, {a: 1, b: stringGetterReturningMac.serialize()});
      expect(validator.isValid(secret)).toBe(false);
    });

    it('should throw error if mac signature is not contructed correctly', function () {
      var throwing = function() {
        MacAttack.createMacWithSchema("http://macattack.com", "(([{\"a\": num}...]) -> num");
      };
      
      expect(throwing).toThrow();
    });
  });
})();