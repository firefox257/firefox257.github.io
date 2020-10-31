var http = require('http');
var fs = require('fs');
var mime = require('mime-types');

var head = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, PATCH, DELETE",
        "Access-Control-Max-Age": 2592000, // 30 days
        "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, Authorization"
      };


http.createServer(function (req, res) 
{
  
  if (req.method === "OPTIONS") {
    res.writeHead(204, head);
    res.end();
    return;
  }
  
  var url =   decodeURI(req.url.toString());
    if(url.endsWith("/"))url+="index.html";
    url=url.substring(1,url.length);
    fs.stat(url, function(err, stat)
    {
      if(err)
      {
          var head = {
             'Content-Type': mime.lookup(".txt")
          };
          res.writeHead(404, head);
          res.write('Not found!');
          res.end();
      }
      else
      {
      
        var range = req.headers.range;
        var fileSize = stat.size;
        var mtype=mime.lookup(url);
        
        if (range) 
        {
          var parts = range.replace(/bytes=/, "").split("-")
          var start = parseInt(parts[0], 10);
          var end = parts[1] ? parseInt(parts[1], 10): fileSize-1;
          var chunksize = (end-start)+1;
          var file = fs.createReadStream(url, {start, end})
          var head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mtype
          };
          res.writeHead(206, head);
          file.pipe(res);
        }
        else 
        {
          var head = {
             'Content-Length': fileSize,
             'Content-Type': mtype
          };
          res.writeHead(200, head);
          fs.createReadStream(url).pipe(res);
        }
      }
    });
}).listen(3001);


