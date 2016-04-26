var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema ({
  name: String,
  password: String,
  email: String,
  profile: String,
  token: String
},
{
  timestamps: true
})
mongoose.model('User', UserSchema);