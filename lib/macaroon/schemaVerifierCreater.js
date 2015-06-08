module.exports = function schemaVerifierCreater(parser, requestData, apiquery) {
	var CAVEAT_PREFIX = /schema = .*/;
	var CAVEAT_PREFIX_LEN = "schema = ".length;

	function verify(caveat, funct) {
		if (CAVEAT_PREFIX.test(caveat)) {
		    	
	    	var schemaString = caveat.substr(CAVEAT_PREFIX_LEN).trim();

	    	var pass = true;
	    	var funValidator = parser.parse(schemaString);

	    	try{
	    		funct(funValidator);
	    	}catch(e){
	    		pass = false;
	    	}
	    	return pass;

	    }
	    return false;
	}

	return {
		verifyFunction: function (caveat) {
			return verify(caveat, function (funValidator) {
				return funValidator.wrap(apiquery)(requestData);
			});
		},
		verifyArguments: function (caveat) {
			return verify(caveat, function (funValidator) {
				return funValidator.argumentContracts.map(function (arg) { return arg.check(requestData); });
			});
		}
	};
};