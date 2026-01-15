import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  contextId: {
    type: String,
    required: true, // e.g., 'casual_main', 'standard_keyword'
  },
  name: {
    type: String,
    default: 'New Conversation',
  },
  difyConversationId: String, // Dify conversation ID
  mode: {
    type: String,
    enum: ['casual', 'standard'],
    required: true,
  },
  tab: String, // For standard mode: 'keyword', 'docgen', 'supplier', 'price'
}, {
  timestamps: true,
});

export default mongoose.model('Conversation', conversationSchema);
