var Module = require('./Module').Module,
    fs = require('fs');

var m = new Module();
var getlogin;
function pleasewait(data) {
  m.say(data.to, data.from+': Currently generating login, please try again soon');
}
function resetmakelogin() {
  getlogin = makelogin;
}
function makelogin(data) {
  getlogin = pleasewait;
  function hex8() {
    return Math.floor(Math.random()*0x100000000).toString(16);
  }
  function hex32() {
    return hex8()+hex8()+hex8()+hex8();
  }
  var login = hex32();
  var secret = hex32();
  fs.writeFile('/home/rav/www/logs.lolwh.at/logins/'+login, secret, function (err) {
    if (err) {
      m.say(data.to, data.from+': Couldn\'t write secret file: '+err);
      getlogin = makelogin;
      return;
    }
    getlogin = function (data) {
      m.say(data.to, data.from+': http://logs.lolwh.at/?login='+login);
    };
    setTimeout(resetmakelogin, 300000);
    getlogin(data);
  });
}
getlogin = makelogin;
m.simplecommand('logs', function (data) {
  getlogin(data);
});
