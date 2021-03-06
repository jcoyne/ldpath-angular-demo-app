ace.define("ace/mode/ldpath_completions", function(require, exports, module) {
  "use strict";
  
  var LdpathCompletions = function() {    
  };

  (function() {
    var tap = "?<__autocomplete>fn:predicates()";
    this.getCompletions = function(editor, session, pos, prefix, callback) {
      var line = session.getLine(pos.row);

      if (!line.match(/=/)) {
        callback(null, []);
        return;
      }

      var segment = session.getLine(pos.row).slice(0,pos.column);
      var tap_location = segment.lastIndexOfRegex(/[\s/]/);
      var rest_of_line = line.slice(tap_location + 1, line.length);
      var post_tap_location = rest_of_line.indexOfRegex(/[\s:]/);
      var good_rest_of_line = post_tap_location == -1 ? "" : rest_of_line.slice(post_tap_location, rest_of_line.length);
      var line_with_tap = line.slice(0, tap_location) + tap + good_rest_of_line;

      if (!line_with_tap.match(/::/)) {
        line_with_tap += " :: xsd:string ;";
      }
      var prefixes = $.grep(session.getLines(0,session.getRowLength()), function(e) { return e.match(/^@prefix/); });
      
      var program = prefixes + "\n" + line_with_tap;

      var $http = editor.$http;
      var $ldpath = editor.$ldpath;
      
      $http.post("/evaluate", { url: $ldpath.url, program: program}).success(function(data,status) {
        callback(null, $.map($.unique(data["__autocomplete"]), function(e) {
          return { value: "<" + e + ">"};
        }));
      });
    }
      
  }).call(LdpathCompletions.prototype);
          
  exports.LdpathCompletions = LdpathCompletions;
});


String.prototype.indexOfRegex = function(regex){
  var match = this.match(regex);
  if(match) return this.indexOf(match[0]);
  else return -1;
}

String.prototype.lastIndexOfRegex = function(regex){
  var match = this.match(regex);
  if(match) return this.lastIndexOf(match[match.length-1]);
  else return -1;
}
