var child = require('child_process');
var fs = require('fs');
var http = require('http');
var mime = require('mime');
var os = require('os');
var path = require('path');

var argv = process.argv.slice(2);
var outfile = path.join(os.tmpdir(), 'index.js');

argv.push('-o');
argv.push(outfile);

var bundler = child.spawn('watchify', argv);
var watcher = fs.watch(outfile);

watcher.on('change', function(event, filename) {
  if (event == 'change') {
    console.log(JSON.stringify({
      time:new Date(),
      level: 'info',
      type: event,
      url: path.basename(filename)
    }));
  }
});

var server = http.createServer(function(req, res) {
  var url = req.url;

  console.log(JSON.stringify({
    time:new Date(),
    level: 'info',
    type: 'request',
    url: url,
  }));

  if (url == '/') {
    res.setHeader('content-type', 'text/html');
    res.end('<!doctype html><head><meta charset="utf-8"></head><body><script src="index.js"></script></body></html>');
  } else {
    var file = (url == '/index.js') ? outfile : file = path.join(process.cwd(), req.url);

    fs.exists(file, function(exists) {
      if (exists) {
        fs.readFile(file, function(error, buffer) {
          if (error) {
            res.writeHead(500);
            res.end('500');
          }

          res.setHeader('content-type', mime.lookup(file));
          res.writeHead(200);
          res.write(buffer);
          res.end();
        });
      } else {
        res.writeHead(404);
        res.end('404');
      }
    });
  }
}).listen(9966, function() {
  console.log(JSON.stringify({
    time:new Date(),
    level: 'info',
    message: 'http running on 9966',
  }));
});