func
  = _ "(" _ "(" _ args:sfunctionargs _ ")" _ "->" _ res:sanything _ ")" _ { 
    return interpreter.func(args, res);
  }

sfunctionargs
  = sarguments / svoid

sanything
  = snonvoid / svoid

snonvoid
  = func / svariable


stuple
  = "[" _ args:sarguments _ "]" 

sarray
  = "[" _ args:sarguments "..." _ "]" 

smap
  = "{" _ args:sarguments "..." _ "}"

sobject
  = "{" _ pairs:spairs _ "}" 

spairs
  = head:spair _ "," _ tail:spairs / head:spair /

spair
  = key:skey _ ":" _ nonvoid:snonvoid

sarguments 
  = head:sanything _ "," _ tail:sarguments / head:sanything

svariable
  = sprimitive / sdatastruct

sdatastruct
  = stuple / sarray / smap / sobject

sprimitive
  = sint / sstr / snum / sbool
  
sint
  = "int"

sstr
  = "str"

snum
  = "num"

sbool
  = "bool" 

svoid
  = "void" 

skey
  = quotation_mark chars:char* quotation_mark 

schar
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
