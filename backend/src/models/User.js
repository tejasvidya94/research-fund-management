const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true,
    enum: ['professor', 'hod', 'dean', 'rnd_helper', 'rnd_main', 'aio', 'finance_officer_helper', 'finance_officer_main', 'registrar', 'vc_office', 'vice_chancellor']
  },
  department: {
    type: String,
    default: 'N/A'
  },
  profilePic: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

