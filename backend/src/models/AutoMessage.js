import mongoose from 'mongoose';

const autoMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  sendDate: {
    type: Date,
    required: true,
    index: true
  },
  isQueued: {
    type: Boolean,
    default: false,
    index: true
  },
  isSent: {
    type: Boolean,
    default: false
  },
  queuedAt: {
    type: Date
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for finding messages to queue
autoMessageSchema.index({ sendDate: 1, isQueued: 1 });

const AutoMessage = mongoose.model('AutoMessage', autoMessageSchema);
export default AutoMessage;