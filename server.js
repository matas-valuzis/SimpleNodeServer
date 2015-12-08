var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var api_dir = path.join(__dirname, 'api');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public_html')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//helper function
function filesFromDir(startPath, filter, callback){    
    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }	
    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
            filesFromDir(filename, filter, callback); //recurse
        }
        else if (filename.indexOf(filter)>=0) {			
			callback(filename);            
        };
    };	
};
console.log("Registering api...");
filesFromDir('./api', '.json', function(file){	
	var url = file.slice(0, -5).replace(/\\/g, "/");
	console.log(url);
	
	app.get('/'+url, function(req, res) {
		fs.readFile(file, function(err, data) {
			if (err) {
			  console.error(err);
			  process.exit(1);
			}
			res.setHeader('Cache-Control', 'no-cache');
			res.json(JSON.parse(data));
		});
	});	
	
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
