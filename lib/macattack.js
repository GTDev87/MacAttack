var macaroons = require('macaroons.js'),
  MacaroonsBuilder = macaroons.MacaroonsBuilder,
	MacaroonsVerifier = macaroons.MacaroonsVerifier,
	parser = require("./parser/parser")(MacaroonsBuilder.deserialize),
	schemaVerifierCreater = require("./macaroon/schemaVerifierCreater");

module.exports = {
  createMac: function(ip, port, databaseSecret) {
    var identifier = "Mac Attack Protocol";
    var location = ip + ":" + port;
    return new MacaroonsBuilder(location, databaseSecret, identifier).getMacaroon();
  },
  createMacWithSchema: function(ip, port, databaseSecret, schema) {
  	var identifier = "Mac Attack Protocol";
    
    var location = ip + ":" + port;
    try{ parser.parse(schema); }
    catch(e){ throw new Error("schema is not valid: " + e.message); }
        
  	return new MacaroonsBuilder(location, databaseSecret, identifier)
  		.add_first_party_caveat("schema = " + schema)
  		.getMacaroon();
  },
  addSchema: function (mac, schema){
    return MacaroonsBuilder.modify(mac)
      .add_first_party_caveat("schema = " + schema)
      .getMacaroon();
  },
  validateMacFunction: function (mac, requestData, apiquery, macVerify) {
  	return (macVerify || new MacaroonsVerifier(mac)).satisfyGeneral(schemaVerifierCreater(parser, requestData, apiquery).verifyFunction);
  },
  validateMac: function (mac, requestData, macVerify) {
    return (macVerify || new MacaroonsVerifier(mac)).satisfyGeneral(schemaVerifierCreater(parser, requestData).verifyArguments);
  },
  validateMacWithChannel: function (mac, requestData, macVerify) {
    //need to honor requestData!!!!!
    return (macVerify || new MacaroonsVerifier(mac)).satisfyGeneral(schemaVerifierCreater(parser, requestData).verifyArguments);
  }
};
