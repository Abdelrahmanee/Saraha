import mongoose from "mongoose";


const questionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  askedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'answered', 'closed'],
    default: 'open',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {timestamps: true});

// Middleware to update 'updatedAt' before save
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const QuestionModel = mongoose.model('Question', questionSchema);

