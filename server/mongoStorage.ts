import { User, Task, TaskApplication, Review, Attendance, Certificate, CertificateTemplate } from "./models";
import type { 
  InsertUser, 
  SelectUser, 
  InsertTask, 
  SelectTask, 
  InsertTaskApplication, 
  SelectTaskApplication 
} from "../shared/schema";

// Utility function to validate MongoDB ObjectIds
function isValidObjectId(id: string): boolean {
  return id && typeof id === 'string' && id.trim() !== '' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
}

export class MongoStorage {
  // User operations
  async getUser(id: string): Promise<SelectUser | null> {
    try {
      if (!isValidObjectId(id)) {
        console.warn(`Invalid user ID provided: "${id}"`);
        return null;
      }

      const user = await User.findById(id).lean();
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        username: user.name, // Map name to username for frontend compatibility
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<SelectUser | null> {
    try {
      const user = await User.findOne({ email }).lean();
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        username: user.name, // Map name to username for frontend compatibility
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  async getUserByEmailWithPassword(email: string): Promise<any | null> {
    try {
      const user = await User.findOne({ email }).lean();
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        username: user.name,
        email: user.email,
        password: user.password, // Include password for authentication
        role: user.role,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error("Error getting user by email with password:", error);
      return null;
    }
  }

  async createUser(userData: any): Promise<SelectUser> {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      
      return {
        id: savedUser._id.toString(),
        username: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        avatar: savedUser.avatar || null,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: any): Promise<SelectUser | null> {
    try {
      const user = await User.findByIdAndUpdate(id, userData, { new: true }).lean();
      if (!user) return null;
      
      return {
        id: user._id.toString(),
        username: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndUpdate(
        userId, 
        { password: hashedPassword, updatedAt: new Date() },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error("Error updating user password:", error);
      return false;
    }
  }

  // Task operations
  async getTasks(): Promise<SelectTask[]> {
    try {
      const tasks = await Task.find().populate('postedBy', 'name email').lean();
      
      return tasks.map((task: any) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        category: task.category,
        location: task.location,
        timeCommitment: `${task.hours || 4} hours`,
        skillsRequired: task.requiredSkills || [],
        status: task.status,
        ngoId: task.postedBy ? task.postedBy._id.toString() : '',
        date: task.date,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
    } catch (error) {
      console.error("Error getting tasks:", error);
      return [];
    }
  }

  async getTask(id: string): Promise<SelectTask | null> {
    try {
      // Validate ObjectId before querying
      if (!isValidObjectId(id)) {
        console.warn(`Invalid task ID provided: "${id}"`);
        return null;
      }

      const task = await Task.findById(id).populate('postedBy', 'name email').lean();
      if (!task) return null;
      
      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        category: task.category,
        location: task.location,
        timeCommitment: `${task.hours || 4} hours`,
        skillsRequired: task.requiredSkills || [],
        status: task.status,
        ngoId: task.postedBy ? task.postedBy._id.toString() : '',
        date: task.date,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error("Error getting task:", error);
      return null;
    }
  }

  async createTask(taskData: any): Promise<SelectTask> {
    try {
      const task = new Task(taskData);
      const savedTask = await task.save();
      await savedTask.populate('postedBy', 'name email');
      
      return {
        id: savedTask._id.toString(),
        title: savedTask.title,
        description: savedTask.description,
        category: savedTask.category || 'General',
        location: savedTask.location,
        timeCommitment: `${savedTask.hours || 4} hours`,
        skillsRequired: savedTask.requiredSkills || [],
        status: savedTask.status,
        ngoId: savedTask.postedBy ? savedTask.postedBy.toString() : '',
        date: savedTask.date,
        createdAt: savedTask.createdAt,
        updatedAt: savedTask.updatedAt
      };
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTask(id: string, taskData: any): Promise<SelectTask | null> {
    try {
      const task = await Task.findByIdAndUpdate(id, taskData, { new: true }).populate('postedBy', 'name email').lean();
      if (!task) return null;
      
      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        category: task.category,
        location: task.location,
        timeCommitment: `${task.hours || 4} hours`,
        skillsRequired: task.requiredSkills || [],
        status: task.status,
        ngoId: task.postedBy ? task.postedBy._id.toString() : '',
        date: task.date,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error("Error updating task:", error);
      return null;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const result = await Task.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("Error deleting task:", error);
      return false;
    }
  }

  // Task Application operations
  async getTaskApplications(): Promise<SelectTaskApplication[]> {
    try {
      const applications = await TaskApplication.find()
        .populate('taskId', 'title description')
        .populate('volunteerId', 'name email')
        .lean();
      
      return applications.map((app: any) => ({
        id: app._id.toString(),
        taskId: app.taskId ? app.taskId._id.toString() : '',
        volunteerId: app.volunteerId ? app.volunteerId._id.toString() : '',
        status: app.status,
        message: app.motivation || null,
        createdAt: app.appliedAt || app.createdAt,
        updatedAt: app.updatedAt || app.appliedAt
      }));
    } catch (error) {
      console.error("Error getting task applications:", error);
      return [];
    }
  }

  async getTaskApplication(id: string): Promise<SelectTaskApplication | null> {
    try {
      const application = await TaskApplication.findById(id)
        .populate('taskId', 'title description')
        .populate('volunteerId', 'name email')
        .lean();
      
      if (!application) return null;
      
      return {
        id: application._id.toString(),
        taskId: application.taskId ? application.taskId._id.toString() : '',
        volunteerId: application.volunteerId ? application.volunteerId._id.toString() : '',
        status: application.status,
        message: application.motivation || null,
        createdAt: application.appliedAt,
        updatedAt: application.updatedAt
      };
    } catch (error) {
      console.error("Error getting task application:", error);
      return null;
    }
  }

  async createTaskApplication(applicationData: any): Promise<SelectTaskApplication> {
    try {
      const application = new TaskApplication(applicationData);
      const savedApplication = await application.save();
      await savedApplication.populate(['taskId', 'volunteerId']);
      
      return {
        id: savedApplication._id.toString(),
        taskId: savedApplication.taskId ? savedApplication.taskId.toString() : '',
        volunteerId: savedApplication.volunteerId ? savedApplication.volunteerId.toString() : '',
        status: savedApplication.status,
        message: savedApplication.motivation || null,
        createdAt: savedApplication.appliedAt,
        updatedAt: savedApplication.updatedAt
      };
    } catch (error) {
      console.error("Error creating task application:", error);
      throw error;
    }
  }

  async updateTaskApplication(id: string, applicationData: any): Promise<SelectTaskApplication | null> {
    try {
      const application = await TaskApplication.findByIdAndUpdate(id, applicationData, { new: true })
        .populate('taskId', 'title description')
        .populate('volunteerId', 'name email')
        .lean();
      
      if (!application) return null;
      
      return {
        id: application._id.toString(),
        taskId: application.taskId ? application.taskId._id.toString() : '',
        volunteerId: application.volunteerId ? application.volunteerId._id.toString() : '',
        status: application.status,
        message: application.motivation || null,
        createdAt: application.appliedAt,
        updatedAt: application.updatedAt
      };
    } catch (error) {
      console.error("Error updating task application:", error);
      return null;
    }
  }

  async deleteTaskApplication(id: string): Promise<boolean> {
    try {
      const result = await TaskApplication.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("Error deleting task application:", error);
      return false;
    }
  }

  // Review operations
  async createReview(reviewData: any): Promise<any> {
    try {
      const review = new Review(reviewData);
      const savedReview = await review.save();
      await savedReview.populate(['taskId', 'reviewerId', 'revieweeId']);
      
      return {
        id: savedReview._id.toString(),
        taskId: savedReview.taskId ? savedReview.taskId.toString() : '',
        reviewerId: savedReview.reviewerId ? savedReview.reviewerId.toString() : '',
        revieweeId: savedReview.revieweeId ? savedReview.revieweeId.toString() : '',
        rating: savedReview.rating,
        comment: savedReview.comment,
        createdAt: savedReview.createdAt
      };
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }

  async getReviewsByUser(userId: string): Promise<any[]> {
    try {
      const reviews = await Review.find({ revieweeId: userId })
        .populate('reviewerId', 'name role')
        .populate('taskId', 'title')
        .lean();
      
      return reviews.map((review: any) => ({
        id: review._id.toString(),
        taskId: review.taskId ? review.taskId._id.toString() : '',
        taskTitle: review.taskId ? review.taskId.title : '',
        reviewerId: review.reviewerId ? review.reviewerId._id.toString() : '',
        reviewerName: review.reviewerId ? review.reviewerId.name : '',
        reviewerRole: review.reviewerId ? review.reviewerId.role : '',
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }));
    } catch (error) {
      console.error("Error getting reviews by user:", error);
      return [];
    }
  }

  async getReviewsByTask(taskId: string): Promise<any[]> {
    try {
      const reviews = await Review.find({ taskId })
        .populate('reviewerId', 'name role')
        .populate('revieweeId', 'name role')
        .lean();
      
      return reviews.map((review: any) => ({
        id: review._id.toString(),
        taskId: review.taskId ? review.taskId.toString() : '',
        reviewerId: review.reviewerId ? review.reviewerId._id.toString() : '',
        reviewerName: review.reviewerId ? review.reviewerId.name : '',
        reviewerRole: review.reviewerId ? review.reviewerId.role : '',
        revieweeId: review.revieweeId ? review.revieweeId._id.toString() : '',
        revieweeName: review.revieweeId ? review.revieweeId.name : '',
        revieweeRole: review.revieweeId ? review.revieweeId.role : '',
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt
      }));
    } catch (error) {
      console.error("Error getting reviews by task:", error);
      return [];
    }
  }

  async getUserAverageRating(userId: string): Promise<number> {
    try {
      const result = await Review.aggregate([
        { $match: { revieweeId: userId } },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } }
      ]);
      
      return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;
    } catch (error) {
      console.error("Error calculating average rating:", error);
      return 0;
    }
  }

  // Helper methods
  async getTasksByNgo(ngoId: string): Promise<SelectTask[]> {
    try {
      const tasks = await Task.find({ postedBy: ngoId }).populate('postedBy', 'name email').lean();
      
      return tasks.map((task: any) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        category: task.category,
        location: task.location,
        timeCommitment: `${task.hours || 4} hours`,
        skillsRequired: task.requiredSkills || [],
        status: task.status,
        ngoId: task.postedBy ? task.postedBy._id.toString() : '',
        date: task.date,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
    } catch (error) {
      console.error("Error getting tasks by NGO:", error);
      return [];
    }
  }

  async getApplicationsByVolunteer(volunteerId: string): Promise<SelectTaskApplication[]> {
    try {
      const applications = await TaskApplication.find({ volunteerId })
        .populate('taskId', 'title description')
        .populate('volunteerId', 'name email')
        .lean();
      
      return applications.map((app: any) => ({
        id: app._id.toString(),
        taskId: app.taskId ? app.taskId._id.toString() : '',
        volunteerId: app.volunteerId ? app.volunteerId._id.toString() : '',
        status: app.status,
        message: app.motivation || null,
        createdAt: app.appliedAt || app.createdAt,
        updatedAt: app.updatedAt || app.appliedAt
      }));
    } catch (error) {
      console.error("Error getting applications by volunteer:", error);
      return [];
    }
  }

  async getApplicationsByTask(taskId: string): Promise<SelectTaskApplication[]> {
    try {
      const applications = await TaskApplication.find({ taskId })
        .populate('taskId', 'title description')
        .populate('volunteerId', 'name email')
        .lean();
      
      return applications.map((app: any) => ({
        id: app._id.toString(),
        taskId: app.taskId ? app.taskId._id.toString() : '',
        volunteerId: app.volunteerId ? app.volunteerId._id.toString() : '',
        status: app.status,
        message: app.motivation || null,
        createdAt: app.appliedAt || app.createdAt,
        updatedAt: app.updatedAt || app.appliedAt
      }));
    } catch (error) {
      console.error("Error getting applications by task:", error);
      return [];
    }
  }

  // Attendance Management
  async createAttendanceRecord(data: any): Promise<any> {
    try {
      const attendance = new Attendance(data);
      const savedAttendance = await attendance.save();
      
      return {
        id: savedAttendance._id.toString(),
        taskId: savedAttendance.taskId.toString(),
        volunteerId: savedAttendance.volunteerId.toString(),
        status: savedAttendance.status,
        markedBy: savedAttendance.markedBy.toString(),
        markedAt: savedAttendance.markedAt,
        notes: savedAttendance.notes || '',
        hoursWorked: savedAttendance.hoursWorked || 0,
        verified: savedAttendance.verified,
        verifiedAt: savedAttendance.verifiedAt,
        verifiedBy: savedAttendance.verifiedBy?.toString() || null
      };
    } catch (error) {
      console.error("Error creating attendance record:", error);
      throw error;
    }
  }

  async getAttendanceByTask(taskId: string): Promise<any[]> {
    try {
      const records = await Attendance.find({ taskId })
        .populate('volunteerId', 'name email')
        .populate('markedBy', 'name')
        .populate('verifiedBy', 'name')
        .lean();
      
      return records.map((record: any) => ({
        id: record._id.toString(),
        taskId: record.taskId.toString(),
        volunteerId: record.volunteerId._id.toString(),
        volunteerName: (record.volunteerId as any).name,
        volunteerEmail: (record.volunteerId as any).email,
        status: record.status,
        markedBy: record.markedBy._id.toString(),
        markedByName: (record.markedBy as any).name,
        markedAt: record.markedAt,
        notes: record.notes || '',
        hoursWorked: record.hoursWorked || 0,
        verified: record.verified,
        verifiedAt: record.verifiedAt,
        verifiedBy: record.verifiedBy?._id.toString() || null,
        verifiedByName: (record.verifiedBy as any)?.name || null
      }));
    } catch (error) {
      console.error("Error getting attendance by task:", error);
      return [];
    }
  }

  async updateAttendanceRecord(id: string, data: any): Promise<any | null> {
    try {
      const attendance = await Attendance.findByIdAndUpdate(id, data, { new: true })
        .populate('volunteerId', 'name email')
        .populate('markedBy', 'name')
        .populate('verifiedBy', 'name')
        .lean();
      
      if (!attendance) return null;
      
      return {
        id: attendance._id.toString(),
        taskId: attendance.taskId.toString(),
        volunteerId: attendance.volunteerId._id.toString(),
        volunteerName: attendance.volunteerId.name,
        volunteerEmail: attendance.volunteerId.email,
        status: attendance.status,
        markedBy: attendance.markedBy._id.toString(),
        markedByName: attendance.markedBy.name,
        markedAt: attendance.markedAt,
        notes: attendance.notes || '',
        hoursWorked: attendance.hoursWorked || 0,
        verified: attendance.verified,
        verifiedAt: attendance.verifiedAt,
        verifiedBy: attendance.verifiedBy?._id.toString() || null,
        verifiedByName: attendance.verifiedBy?.name || null
      };
    } catch (error) {
      console.error("Error updating attendance record:", error);
      return null;
    }
  }

  async getAttendanceByVolunteer(volunteerId: string): Promise<any[]> {
    try {
      const records = await Attendance.find({ volunteerId })
        .populate('taskId', 'title organization date')
        .populate('markedBy', 'name')
        .lean();
      
      return records.map((record: any) => ({
        id: record._id.toString(),
        taskId: record.taskId._id.toString(),
        taskTitle: record.taskId.title,
        taskOrganization: record.taskId.organization,
        taskDate: record.taskId.date,
        volunteerId: record.volunteerId.toString(),
        status: record.status,
        markedBy: record.markedBy._id.toString(),
        markedByName: record.markedBy.name,
        markedAt: record.markedAt,
        hoursWorked: record.hoursWorked || 0,
        verified: record.verified
      }));
    } catch (error) {
      console.error("Error getting attendance by volunteer:", error);
      return [];
    }
  }

  // Certificate Management
  async createCertificate(data: any): Promise<any> {
    try {
      const certificate = new Certificate(data);
      const savedCertificate = await certificate.save();
      
      return {
        id: savedCertificate._id.toString(),
        taskId: savedCertificate.taskId.toString(),
        volunteerId: savedCertificate.volunteerId.toString(),
        certificateNumber: savedCertificate.certificateNumber,
        certificateUrl: savedCertificate.certificateUrl,
        templateUsed: savedCertificate.templateUsed,
        status: savedCertificate.status,
        requestedAt: savedCertificate.requestedAt,
        generatedAt: savedCertificate.generatedAt,
        issuedAt: savedCertificate.issuedAt,
        downloadedAt: savedCertificate.downloadedAt,
        hoursCompleted: savedCertificate.hoursCompleted,
        skills: savedCertificate.skills
      };
    } catch (error) {
      console.error("Error creating certificate:", error);
      throw error;
    }
  }

  async getCertificatesByTask(taskId: string): Promise<any[]> {
    try {
      const certificates = await Certificate.find({ taskId })
        .populate('volunteerId', 'name email')
        .lean();
      
      return certificates.map((cert: any) => ({
        id: cert._id.toString(),
        taskId: cert.taskId.toString(),
        volunteerId: cert.volunteerId._id.toString(),
        volunteerName: cert.volunteerId.name,
        volunteerEmail: cert.volunteerId.email,
        certificateNumber: cert.certificateNumber,
        certificateUrl: cert.certificateUrl,
        status: cert.status,
        generatedAt: cert.generatedAt,
        hoursCompleted: cert.hoursCompleted,
        skills: cert.skills
      }));
    } catch (error) {
      console.error("Error getting certificates by task:", error);
      return [];
    }
  }

  async getCertificatesByVolunteer(volunteerId: string): Promise<any[]> {
    try {
      const certificates = await Certificate.find({ volunteerId })
        .populate('taskId', 'title organization date')
        .lean();
      
      return certificates.map((cert: any) => ({
        id: cert._id.toString(),
        taskId: cert.taskId._id.toString(),
        taskTitle: cert.taskId.title,
        taskOrganization: cert.taskId.organization,
        taskDate: cert.taskId.date,
        volunteerId: cert.volunteerId.toString(),
        certificateNumber: cert.certificateNumber,
        certificateUrl: cert.certificateUrl,
        status: cert.status,
        generatedAt: cert.generatedAt,
        hoursCompleted: cert.hoursCompleted,
        skills: cert.skills
      }));
    } catch (error) {
      console.error("Error getting certificates by volunteer:", error);
      return [];
    }
  }

  // Certificate Template Management
  async createCertificateTemplate(data: any): Promise<any> {
    try {
      const template = new CertificateTemplate(data);
      const savedTemplate = await template.save();
      
      return {
        id: savedTemplate._id.toString(),
        ngoId: savedTemplate.ngoId.toString(),
        templateName: savedTemplate.templateName,
        templateUrl: savedTemplate.templateUrl,
        templateType: savedTemplate.templateType,
        isActive: savedTemplate.isActive,
        placeholderTags: savedTemplate.placeholderTags,
        templateInstructions: savedTemplate.templateInstructions,
        createdAt: savedTemplate.createdAt,
        updatedAt: savedTemplate.updatedAt
      };
    } catch (error) {
      console.error("Error creating certificate template:", error);
      throw error;
    }
  }

  async getCertificateTemplatesByNGO(ngoId: string): Promise<any[]> {
    try {
      const templates = await CertificateTemplate.find({ ngoId }).lean();
      
      return templates.map((template: any) => ({
        id: template._id.toString(),
        ngoId: template.ngoId.toString(),
        templateName: template.templateName,
        templateUrl: template.templateUrl,
        templateType: template.templateType,
        isActive: template.isActive,
        placeholderTags: template.placeholderTags,
        templateInstructions: template.templateInstructions,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }));
    } catch (error) {
      console.error("Error getting certificate templates by NGO:", error);
      return [];
    }
  }

  async updateCertificateTemplate(id: string, data: any): Promise<any | null> {
    try {
      const template = await CertificateTemplate.findByIdAndUpdate(id, data, { new: true }).lean();
      if (!template) return null;
      
      return {
        id: template._id.toString(),
        ngoId: template.ngoId.toString(),
        templateName: template.templateName,
        templateUrl: template.templateUrl,
        templateType: template.templateType,
        isActive: template.isActive,
        placeholderTags: template.placeholderTags,
        templateInstructions: template.templateInstructions,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      };
    } catch (error) {
      console.error("Error updating certificate template:", error);
      return null;
    }
  }

  async updateApplicationStatus(applicationId: string, status: string, additionalData: any = {}): Promise<any | null> {
    try {
      const updateData = { status, ...additionalData };
      
      const application = await TaskApplication.findByIdAndUpdate(
        applicationId,
        updateData,
        { new: true }
      )
        .populate('taskId', 'title description location date organization')
        .populate('volunteerId', 'name email')
        .lean();
      
      if (!application) return null;
      
      return {
        id: application._id.toString(),
        taskId: (application.taskId as any)._id.toString(),
        volunteerId: (application.volunteerId as any)._id.toString(),
        status: application.status,
        motivation: application.motivation,
        appliedAt: application.appliedAt,
        approvedAt: application.approvedAt,
        task: {
          id: (application.taskId as any)._id.toString(),
          title: (application.taskId as any).title,
          description: (application.taskId as any).description,
          location: (application.taskId as any).location,
          date: (application.taskId as any).date,
          organization: (application.taskId as any).organization
        },
        volunteer: {
          id: (application.volunteerId as any)._id.toString(),
          name: (application.volunteerId as any).name,
          email: (application.volunteerId as any).email
        }
      };
    } catch (error) {
      console.error("Error updating application status:", error);
      return null;
    }
  }

  async getApplicationByTaskAndVolunteer(taskId: string, volunteerId: string): Promise<any | null> {
    try {
      const application = await TaskApplication.findOne({ taskId, volunteerId })
        .populate('taskId', 'title description location date organization')
        .populate('volunteerId', 'name email')
        .lean();
      
      if (!application) return null;
      
      return {
        id: application._id.toString(),
        taskId: application.taskId._id.toString(),
        volunteerId: application.volunteerId._id.toString(),
        status: application.status,
        motivation: application.motivation,
        appliedAt: application.appliedAt,
        approvedAt: application.approvedAt,
        task: {
          id: application.taskId._id.toString(),
          title: application.taskId.title,
          description: application.taskId.description,
          location: application.taskId.location,
          date: application.taskId.date,
          organization: application.taskId.organization
        },
        volunteer: {
          id: application.volunteerId._id.toString(),
          name: application.volunteerId.name,
          email: application.volunteerId.email
        }
      };
    } catch (error) {
      console.error("Error getting application by task and volunteer:", error);
      return null;
    }
  }

  async getAttendanceByTaskAndVolunteer(taskId: string, volunteerId: string): Promise<any | null> {
    try {
      const attendance = await Attendance.findOne({ taskId, volunteerId })
        .populate('volunteerId', 'name email')
        .populate('markedBy', 'name')
        .populate('verifiedBy', 'name')
        .lean();
      
      if (!attendance) return null;
      
      return {
        id: attendance._id.toString(),
        taskId: attendance.taskId.toString(),
        volunteerId: attendance.volunteerId._id.toString(),
        volunteerName: attendance.volunteerId.name,
        volunteerEmail: attendance.volunteerId.email,
        status: attendance.status,
        markedBy: attendance.markedBy._id.toString(),
        markedByName: attendance.markedBy.name,
        markedAt: attendance.markedAt,
        notes: attendance.notes || '',
        hoursWorked: attendance.hoursWorked || 0,
        verified: attendance.verified,
        verifiedAt: attendance.verifiedAt,
        verifiedBy: attendance.verifiedBy?._id.toString() || null,
        verifiedByName: attendance.verifiedBy?.name || null
      };
    } catch (error) {
      console.error("Error getting attendance by task and volunteer:", error);
      return null;
    }
  }

  async getCertificateByTaskAndVolunteer(taskId: string, volunteerId: string): Promise<any | null> {
    try {
      const certificate = await Certificate.findOne({ taskId, volunteerId }).lean();
      
      if (!certificate) return null;
      
      return {
        id: certificate._id.toString(),
        taskId: certificate.taskId.toString(),
        volunteerId: certificate.volunteerId.toString(),
        certificateNumber: certificate.certificateNumber,
        certificateUrl: certificate.certificateUrl,
        templateUsed: certificate.templateUsed,
        status: certificate.status,
        requestedAt: certificate.requestedAt,
        generatedAt: certificate.generatedAt,
        issuedAt: certificate.issuedAt,
        downloadedAt: certificate.downloadedAt,
        hoursCompleted: certificate.hoursCompleted,
        skills: certificate.skills
      };
    } catch (error) {
      console.error("Error getting certificate by task and volunteer:", error);
      return null;
    }
  }

  async getApplication(applicationId: string): Promise<any | null> {
    try {
      const application = await TaskApplication.findById(applicationId)
        .populate('taskId', 'title description location date organization')
        .populate('volunteerId', 'name email')
        .lean();
      
      if (!application) return null;
      
      return {
        id: application._id.toString(),
        taskId: application.taskId._id.toString(),
        volunteerId: application.volunteerId._id.toString(),
        status: application.status,
        motivation: application.motivation,
        appliedAt: application.appliedAt,
        approvedAt: application.approvedAt,
        task: {
          id: application.taskId._id.toString(),
          title: application.taskId.title,
          description: application.taskId.description,
          location: application.taskId.location,
          date: application.taskId.date,
          organization: application.taskId.organization
        },
        volunteer: {
          id: application.volunteerId._id.toString(),
          name: application.volunteerId.name,
          email: application.volunteerId.email
        }
      };
    } catch (error) {
      console.error("Error getting application:", error);
      return null;
    }
  }

  // Attendance operations
  async getAttendanceByTask(taskId: string): Promise<any[]> {
    try {
      const attendance = await Attendance.find({ taskId })
        .populate('volunteerId', 'name email')
        .populate('taskId', 'title date location')
        .lean();
      
      return attendance.map(att => ({
        id: att._id.toString(),
        taskId: att.taskId._id.toString(),
        volunteerId: att.volunteerId._id.toString(),
        volunteerName: att.volunteerId.name,
        volunteerEmail: att.volunteerId.email,
        status: att.status,
        markedAt: att.markedAt,
        hoursCompleted: att.hoursCompleted,
        notes: att.notes,
        task: {
          title: att.taskId.title,
          date: att.taskId.date,
          location: att.taskId.location
        }
      }));
    } catch (error) {
      console.error("Error getting attendance by task:", error);
      return [];
    }
  }

  async getAttendanceByVolunteer(volunteerId: string): Promise<any[]> {
    try {
      const attendance = await Attendance.find({ volunteerId })
        .populate('taskId', 'title date location ngoId')
        .populate('ngoId', 'name')
        .lean();
      
      return attendance.map(att => ({
        id: att._id.toString(),
        taskId: att.taskId._id.toString(),
        volunteerId: att.volunteerId.toString(),
        status: att.status,
        markedAt: att.markedAt,
        hoursCompleted: att.hoursCompleted,
        task: {
          title: att.taskId.title,
          date: att.taskId.date,
          location: att.taskId.location,
          organization: att.ngoId?.name || 'Unknown Organization'
        }
      }));
    } catch (error) {
      console.error("Error getting attendance by volunteer:", error);
      return [];
    }
  }

  async markAttendance(taskId: string, volunteerId: string, status: 'present' | 'absent', markedBy: string, hoursCompleted: number = 0): Promise<any> {
    try {
      // Check if attendance record already exists
      let attendance = await Attendance.findOne({ taskId, volunteerId });
      
      if (attendance) {
        // Update existing record
        attendance.status = status;
        attendance.markedAt = new Date();
        attendance.markedBy = markedBy;
        attendance.hoursCompleted = hoursCompleted;
        await attendance.save();
      } else {
        // Create new attendance record
        attendance = new Attendance({
          taskId,
          volunteerId,
          ngoId: markedBy,
          status,
          markedAt: new Date(),
          markedBy,
          hoursCompleted
        });
        await attendance.save();
      }

      // Populate the response
      await attendance.populate('volunteerId', 'name email');
      await attendance.populate('taskId', 'title date');
      
      return {
        id: attendance._id.toString(),
        taskId: attendance.taskId._id.toString(),
        volunteerId: attendance.volunteerId._id.toString(),
        volunteerName: attendance.volunteerId.name,
        status: attendance.status,
        markedAt: attendance.markedAt,
        hoursCompleted: attendance.hoursCompleted
      };
    } catch (error) {
      console.error("Error marking attendance:", error);
      return null;
    }
  }

  async getTodaysTasks(ngoId: string): Promise<any[]> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      const tasks = await Task.find({
        postedBy: ngoId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).lean();

      return tasks.map(task => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        location: task.location,
        date: task.date,
        status: task.status,
        skillsRequired: task.requiredSkills || []
      }));
    } catch (error) {
      console.error("Error getting today's tasks:", error);
      return [];
    }
  }

  // Certificate operations
  async generateCertificate(taskId: string, volunteerId: string): Promise<any> {
    try {
      // Check if certificate already exists
      let certificate = await Certificate.findOne({ taskId, volunteerId });
      if (certificate) {
        return {
          id: certificate._id.toString(),
          certificateNumber: certificate.certificateNumber,
          status: certificate.status,
          certificateUrl: certificate.certificateUrl
        };
      }

      // Get task and volunteer details
      const task = await Task.findById(taskId).populate('postedBy', 'name');
      const volunteer = await User.findById(volunteerId);
      const attendance = await Attendance.findOne({ taskId, volunteerId, status: 'present' });

      if (!task || !volunteer || !attendance) {
        throw new Error('Task, volunteer, or attendance record not found');
      }

      // Generate certificate number
      const certNumber = `CERT-${Date.now()}-${volunteerId.slice(-4)}`;
      
      // Create certificate record
      certificate = new Certificate({
        taskId,
        volunteerId,
        certificateNumber: certNumber,
        certificateUrl: `/certificates/${certNumber}.pdf`, // This will be updated when PDF is generated
        templateUsed: 'default',
        status: 'generated',
        hoursCompleted: attendance.hoursCompleted,
        skills: task.requiredSkills || []
      });

      await certificate.save();

      return {
        id: certificate._id.toString(),
        certificateNumber: certificate.certificateNumber,
        status: certificate.status,
        certificateUrl: certificate.certificateUrl,
        volunteerName: volunteer.name,
        taskTitle: task.title,
        ngoName: task.postedBy.name,
        hoursCompleted: attendance.hoursCompleted,
        taskDate: task.date
      };
    } catch (error) {
      console.error("Error generating certificate:", error);
      return null;
    }
  }

  async getCertificatesByTask(taskId: string): Promise<any[]> {
    try {
      const certificates = await Certificate.find({ taskId })
        .populate('volunteerId', 'name email')
        .populate('taskId', 'title date')
        .lean();
      
      return certificates.map(cert => ({
        id: cert._id.toString(),
        certificateNumber: cert.certificateNumber,
        volunteerName: cert.volunteerId.name,
        volunteerEmail: cert.volunteerId.email,
        status: cert.status,
        generatedAt: cert.generatedAt,
        downloadedAt: cert.downloadedAt,
        hoursCompleted: cert.hoursCompleted
      }));
    } catch (error) {
      console.error("Error getting certificates by task:", error);
      return [];
    }
  }

  async getCertificatesByVolunteer(volunteerId: string): Promise<any[]> {
    try {
      const certificates = await Certificate.find({ volunteerId })
        .populate('taskId', 'title date location postedBy')
        .populate({
          path: 'taskId',
          populate: {
            path: 'postedBy',
            select: 'name'
          }
        })
        .lean();
      
      return certificates.map(cert => ({
        id: cert._id.toString(),
        certificateNumber: cert.certificateNumber,
        certificateUrl: cert.certificateUrl,
        status: cert.status,
        generatedAt: cert.generatedAt,
        downloadedAt: cert.downloadedAt,
        hoursCompleted: cert.hoursCompleted,
        task: {
          title: cert.taskId.title,
          date: cert.taskId.date,
          location: cert.taskId.location,
          organization: cert.taskId.postedBy?.name || 'Unknown Organization'
        }
      }));
    } catch (error) {
      console.error("Error getting certificates by volunteer:", error);
      return [];
    }
  }

  async downloadCertificate(certificateId: string): Promise<string | null> {
    try {
      const certificate = await Certificate.findById(certificateId);
      if (!certificate) return null;

      // Update download status
      certificate.status = 'downloaded';
      certificate.downloadedAt = new Date();
      await certificate.save();

      return certificate.certificateUrl;
    } catch (error) {
      console.error("Error downloading certificate:", error);
      return null;
    }
  }
}

export const storage = new MongoStorage();
