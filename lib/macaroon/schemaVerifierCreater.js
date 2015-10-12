module.exports = function schemaVerifierCreater(parser, requestData, apiquery) {
	var CAVEAT_PREFIX = /schema = .*/;
	var CAVEAT_PREFIX_LEN = "schema = ".length;


	function verify(caveat, funct) {
		if (!CAVEAT_PREFIX.test(caveat)) { return false; }
		    	
  	var schemaString = caveat.substr(CAVEAT_PREFIX_LEN).trim();
  	var pass = true;
  	var requestValidator = parser.parse(schemaString);

  	try{ funct(requestValidator); }
  	catch(e){ pass = false; }
  	return pass;
	}

	return {
		verifyFunction: function (caveat) {
			return verify(caveat, function (requestValidator) {
				return requestValidator.check({_args: [requestData], _return: apiquery(requestData)});
			});
		},
		verifyArguments: function (caveat) {
			return verify(caveat, function (requestValidator) {
				return requestValidator.fieldContracts._args[0].check(requestData);
			});
		}
	};
};