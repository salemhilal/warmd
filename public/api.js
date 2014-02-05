var Warmd = function() {

  var t = this;
  
  var makeJsonReq = function(type, url, callback) {
    
    var r = new XMLHttpRequest();
    r.open("GET", url);

    r.onreadystatechange = function() {
     
      if (r.readyState === 4) {
     
        if (r.status === 200) {
          fm(JSON.parse(r.responseText));
        } else {
          console.error(r);
          fn(null, {
            status: r.status,
            statusText: r.statusText
          });
        }

      }
    }
  };

  var getJson = function(url, callback) {
    makeJsonReq("GET", url, callback);
  }

  t.queryUsers = function(str, callback() {
     
  });

}
