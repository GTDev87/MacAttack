{
  var thisParser = this;
  var grammarValidationObj = thisParser.grammarValidationObj;
}

start
  = startfunc

startfunc
  = _ "(" _ "(" _ args:functionargs _ ")" _ "->" _ res:anything _ ")" _ { 
    return grammarValidationObj.startfunc(args, res);
  }

anything
  = nonvoid / void

nonvoid
  = func / variable

func
  = _ "(" _ "(" _ args:functionargs _ ")" _ "->" _ res:anything _ ")" _ { 
    return grammarValidationObj.func(args, res);
  }

functionargs
  = arguments / void

tuple
  = "[" _ args:arguments _ "]" { 
    return grammarValidationObj.tuple(args);
  }

array
  = "[" _ args:arguments "..." _ "]" { 
    return grammarValidationObj.array(args);
  }

map
  = "{" _ args:arguments "..." _ "}" { 
    return grammarValidationObj.map(args);
  }

object
  = "{" _ pairs:pairs _ "}" { 
    return grammarValidationObj.object(pairs);
  }

pairs
  = head:pair _ "," _ tail:pairs {return [head].concat(tail);} / head:pair {return [head]; } / 

pair
  = key:key _ ":" _ nonvoid:nonvoid { return [key, nonvoid];}

arguments 
  = head:anything _ "," _ tail:arguments {return [head].concat(tail);} / head:anything {return [head]; }

variable
  = primitive / datastruct

datastruct
  = tuple / array / map / object

primitive
  = int / str / num / bool
  
int
  = "int" {return grammarValidationObj.int();}

str
  = "str"  {return grammarValidationObj.str();}

num
  = "num"  {return grammarValidationObj.num();}

bool
  = "bool"  {return grammarValidationObj.bool();}

void
  = "void" {return grammarValidationObj.void();}

key
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape         = "\\"
quotation_mark = '"'
unescaped      = [\x20-\x21\x23-\x5B\x5D-\u10FFFF]


//optional whitespace
_  = [ \t\r\n]*

/* ----- Core ABNF Rules ----- */

/* See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4627). */
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i