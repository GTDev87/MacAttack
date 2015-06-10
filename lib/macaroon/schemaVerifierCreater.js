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
			//inside of requestData will be a macaroon
			//it is a string when deciphered it will have a signature "(({}) -> int)"
			//need to match signature with caveat signature part.
			
			// this can be achieved by:
			// 1. a mock object put into parser
			//    - complication if functions within functions need to be tested need to be called separately

			// 2. comparing signature in macaroon to signature in request
			//    - need to handle inheretance and interfaces.  i.e. sub parts of an object.


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