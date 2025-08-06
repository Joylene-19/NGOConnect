import mongoose from 'mongoose';

// User schema
const userSchema = new mongoose.Schema({
  name: {
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
  role: {
    type: String,
    enum: ['volunteer', 'ngo', 'admin'],
    default: 'volunteer'
  },
  avatar: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a virtual for id
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Contact message schema
const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'resolved'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add virtuals
contactSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model('User', userSchema);

// Task schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    default: "1 hour"
  },
  hours: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  taskStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appliedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  approvedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxVolunteers: {
    type: Number,
    default: 10
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    default: 'General'
  },
  remarks: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorRole: {
      type: String,
      enum: ['ngo', 'volunteer'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a virtual for id
taskSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for volunteer count
taskSchema.virtual('volunteers').get(function() {
  return this.appliedVolunteers?.length || 0;
});

// Virtual for skills array
taskSchema.virtual('skills').get(function() {
  return this.requiredSkills || [];
});

// Virtual for organization name
taskSchema.virtual('organization').get(function() {
  return (this.postedBy as any)?.name || 'Organization';
});

// Update the updatedAt field on save
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Task = mongoose.model('Task', taskSchema);

// Task Application schema
const taskApplicationSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  motivation: {
    type: String,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  },
  attendance: {
    type: String,
    enum: ['present', 'absent', 'not-marked'],
    default: 'not-marked'
  },
  attendanceMarkedAt: {
    type: Date,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  certificateRequested: {
    type: Boolean,
    default: false
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

taskApplicationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

taskApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const TaskApplication = mongoose.model('TaskApplication', taskApplicationSchema);

// Review schema
const reviewSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Review = mongoose.model('Review', reviewSchema);

// Attendance Record schema
const attendanceSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'not-marked'],
    default: 'not-marked'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

attendanceSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const Attendance = mongoose.model('Attendance', attendanceSchema);

// Certificate Record schema
const certificateSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true
  },
  certificateUrl: {
    type: String,
    required: true
  },
  templateUsed: {
    type: String,
    default: 'default'
  },
  status: {
    type: String,
    enum: ['requested', 'generated', 'issued', 'downloaded'],
    default: 'generated'
  },
  requestedAt: {
    type: Date,
    default: null
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  issuedAt: {
    type: Date,
    default: null
  },
  downloadedAt: {
    type: Date,
    default: null
  },
  hoursCompleted: {
    type: Number,
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }]
});

certificateSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const Certificate = mongoose.model('Certificate', certificateSchema);

// Certificate Template schema
const certificateTemplateSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateName: {
    type: String,
    required: true,
    trim: true
  },
  templateUrl: {
    type: String,
    required: true
  },
  templateType: {
    type: String,
    enum: ['image', 'pdf', 'html'],
    default: 'html'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  placeholderTags: {
    volunteerName: { type: String, default: "<<VOLUNTEER_NAME>>" },
    taskTitle: { type: String, default: "<<TASK_TITLE>>" },
    taskDate: { type: String, default: "<<TASK_DATE>>" },
    completionDate: { type: String, default: "<<COMPLETION_DATE>>" },
    hours: { type: String, default: "<<HOURS>>" },
    ngoName: { type: String, default: "<<NGO_NAME>>" },
    certificateNumber: { type: String, default: "<<CERTIFICATE_NUMBER>>" },
    issueDate: { type: String, default: "<<ISSUE_DATE>>" },
    ngoSignature: { type: String, default: "<<NGO_SIGNATURE>>" },
    volunteerSkills: { type: String, default: "<<VOLUNTEER_SKILLS>>" }
  },
  templateInstructions: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

certificateTemplateSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export const CertificateTemplate = mongoose.model('CertificateTemplate', certificateTemplateSchema);

export const Contact = mongoose.model('Contact', contactSchema);