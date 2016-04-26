var mongoose = require('mongoose');
var fs = require('fs');
// mongoose.connect("mongodb://127.0.0.1:27017/cream");
mongoose.connect("mongodb://localhost/cream");
var modelsPath = __dirname + '/../models';
fs.readdirSync(modelsPath).forEach(function(file){
	if(file.indexOf('js')>0){
		require(modelsPath + '/' + file);
	}
});