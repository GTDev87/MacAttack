var _ = require('lodash'),
  macaroons = require('node-macaroons'),
	parser = require("./parser/parser")(macaroons.deserialize),
	schemaVerifierCreater = require("./macaroon/schemaVerifierCreater");

module.exports = {
  createMac: function(ip, port, databaseSecret) {
    var identifier = "Mac Attack Protocol";
    var location = ip + ":" + port;

    return macaroons.newMacaroon(databaseSecret, identifier, location);
  },
  createMacWithSchema: function(ip, port, databaseSecret, schema) {
  	var identifier = "Mac Attack Protocol";
    var location = ip + ":" + port;
    try{ parser.parse(schema); }
    catch(e){ throw new Error("schema is not valid: " + e.message); }
        
  	return macaroons.newMacaroon(databaseSecret, identifier, location)
      .addFirstPartyCaveat("schema = " + schema);
  },
  addSchema: function (mac, schema){
    return mac.addFirstPartyCaveat("schema = " + schema);
  },
  validateMacFunction: function (macVerify, requestData, apiquery) {
  	return macVerify.addCaveatCheck(schemaVerifierCreater(parser, requestData, apiquery).verifyFunction);
  },
  validateMac: function (macVerify, requestData) {
    return macVerify.addCaveatCheck(schemaVerifierCreater(parser, requestData).verifyArguments);
  },
  validateMacWithChannel: function (macVerify, requestData) {
    return macVerify.addCaveatCheck(schemaVerifierCreater(parser, requestData).verifyArguments);
  }
};
