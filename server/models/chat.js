var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ChatSchema = new Schema ({
  room_name: String,
  message: String,
  _user: {type: Schema.ObjectId, ref: 'User'}
},
{
  timestamps: true
});
mongoose.model('ChatRoom', ChatSchema);
