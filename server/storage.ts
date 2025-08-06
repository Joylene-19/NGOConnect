import { 
  users, 
  projects, 
  serverStatus, 
  projectStats,
  tasks,
  taskApplications,
  reviews,
  certificates,
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type ServerStatus,
  type InsertServerStatus,
  type ProjectStats,
  type InsertProjectStats,
  type Task,
  type InsertTask,
  type TaskApplication,
  type InsertTaskApplication,
  type Review,
  type InsertReview,
  type Certificate,
  type InsertCertificate
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Server status methods
  getServerStatus(): Promise<ServerStatus[]>;
  updateServerStatus(status: InsertServerStatus): Promise<ServerStatus>;
  
  // Project stats methods
  getProjectStats(projectId: number): Promise<ProjectStats | undefined>;
  updateProjectStats(stats: InsertProjectStats): Promise<ProjectStats>;

  // Task methods
  getTasks(): Promise<Task[]>;
  getTasksByNgo(ngoId: number): Promise<Task[]>;
  getTasksForVolunteer(volunteerId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number | string): Promise<boolean>;
  
  // Task application methods
  getTaskApplications(taskId: number): Promise<TaskApplication[]>;
  getVolunteerApplications(volunteerId: number): Promise<TaskApplication[]>;
  createTaskApplication(application: InsertTaskApplication): Promise<TaskApplication>;
  updateTaskApplication(id: number, updates: Partial<InsertTaskApplication>): Promise<TaskApplication>;
  
  // Review methods
  getTaskReviews(taskId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Certificate methods
  getCertificates(volunteerId: number): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  
  // Attendance methods
  getAttendanceByTask(taskId: number): Promise<any[]>;
  getAttendanceByVolunteer(volunteerId: number): Promise<any[]>;
  markAttendance(taskId: number, volunteerId: number, status: 'present' | 'absent', markedBy: number): Promise<any>;
  getTodaysTasks(ngoId: number): Promise<Task[]>;
  
  // Certificate management methods
  generateCertificate(taskId: number, volunteerId: number): Promise<any>;
  downloadCertificate(certificateId: number): Promise<string | null>;
  getCertificatesByTask(taskId: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private serverStatuses: Map<string, ServerStatus>;
  private projectStats: Map<number, ProjectStats>;
  private tasks: Map<number, Task>;
  private taskApplications: Map<number, TaskApplication>;
  private reviews: Map<number, Review>;
  private certificates: Map<number, Certificate>;
  private currentUserId: number;
  private currentProjectId: number;
  private currentServerStatusId: number;
  private currentProjectStatsId: number;
  private currentTaskId: number;
  private currentTaskApplicationId: number;
  private currentReviewId: number;
  private currentCertificateId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.serverStatuses = new Map();
    this.projectStats = new Map();
    this.tasks = new Map();
    this.taskApplications = new Map();
    this.reviews = new Map();
    this.certificates = new Map();
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentServerStatusId = 1;
    this.currentProjectStatsId = 1;
    this.currentTaskId = 1;
    this.currentTaskApplicationId = 1;
    this.currentReviewId = 1;
    this.currentCertificateId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample project
    const sampleProject: Project = {
      id: 1,
      name: "Full-Stack Project",
      description: "React + Express + PostgreSQL + Tailwind CSS + Shadcn UI",
      techStack: ["React", "Express", "PostgreSQL", "Tailwind CSS", "Shadcn UI"],
      status: "development",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(1, sampleProject);

    // Create sample server statuses
    const frontendStatus: ServerStatus = {
      id: 1,
      service: "Frontend",
      status: "running",
      port: 5173,
      lastChecked: new Date(),
    };
    const backendStatus: ServerStatus = {
      id: 2,
      service: "Backend",
      status: "running",
      port: 3001,
      lastChecked: new Date(),
    };
    const databaseStatus: ServerStatus = {
      id: 3,
      service: "Database",
      status: "running",
      port: null,
      lastChecked: new Date(),
    };
    
    this.serverStatuses.set("Frontend", frontendStatus);
    this.serverStatuses.set("Backend", backendStatus);
    this.serverStatuses.set("Database", databaseStatus);

    // Create sample project stats
    const sampleStats: ProjectStats = {
      id: 1,
      projectId: 1,
      components: 24,
      apiRoutes: 12,
      databaseModels: 5,
      pages: 8,
    };
    this.projectStats.set(1, sampleStats);

    // Create sample tasks
    const sampleTask1: Task = {
      id: 1,
      title: "Beach Cleanup Drive",
      description: "Help clean up the local beach and protect marine life. We'll provide all necessary equipment and refreshments.",
      location: "Santa Monica Beach, CA",
      requiredSkills: ["Physical fitness", "Environmental awareness"],
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      hours: 4,
      status: "Not Started",
      postedBy: 1, // Sample NGO user
      appliedVolunteers: [],
      approvedVolunteers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sampleTask2: Task = {
      id: 2,
      title: "Food Bank Distribution",
      description: "Help distribute food packages to families in need. Great opportunity to make a direct impact on the community.",
      location: "Downtown Food Bank, Los Angeles",
      requiredSkills: ["Communication", "Organization"],
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      hours: 3,
      status: "Not Started",
      postedBy: 1,
      appliedVolunteers: [],
      approvedVolunteers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sampleTask3: Task = {
      id: 3,
      title: "Senior Center Reading Program",
      description: "Read books and engage in conversations with elderly residents. Bring joy and companionship to seniors.",
      location: "Sunrise Senior Center, Beverly Hills",
      requiredSkills: ["Reading", "Patience", "Communication"],
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      hours: 2,
      status: "Not Started",
      postedBy: 1,
      appliedVolunteers: [],
      approvedVolunteers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(1, sampleTask1);
    this.tasks.set(2, sampleTask2);
    this.tasks.set(3, sampleTask3);

    this.currentProjectId = 2;
    this.currentServerStatusId = 4;
    this.currentProjectStatsId = 2;
    this.currentTaskId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "volunteer",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      status: insertProject.status || "development",
      description: insertProject.description || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async getServerStatus(): Promise<ServerStatus[]> {
    return Array.from(this.serverStatuses.values());
  }

  async updateServerStatus(insertStatus: InsertServerStatus): Promise<ServerStatus> {
    const existing = this.serverStatuses.get(insertStatus.service);
    if (existing) {
      const updated: ServerStatus = {
        ...existing,
        ...insertStatus,
        lastChecked: new Date(),
      };
      this.serverStatuses.set(insertStatus.service, updated);
      return updated;
    } else {
      const id = this.currentServerStatusId++;
      const status: ServerStatus = {
        ...insertStatus,
        id,
        port: insertStatus.port || null,
        lastChecked: new Date(),
      };
      this.serverStatuses.set(insertStatus.service, status);
      return status;
    }
  }

  async getProjectStats(projectId: number): Promise<ProjectStats | undefined> {
    return this.projectStats.get(projectId);
  }

  async updateProjectStats(insertStats: InsertProjectStats): Promise<ProjectStats> {
    const existing = Array.from(this.projectStats.values()).find(
      stats => stats.projectId === insertStats.projectId
    );
    
    if (existing) {
      const updated: ProjectStats = { ...existing, ...insertStats };
      this.projectStats.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentProjectStatsId++;
      const stats: ProjectStats = { 
        ...insertStats, 
        id,
        projectId: insertStats.projectId || null,
        components: insertStats.components || null,
        apiRoutes: insertStats.apiRoutes || null,
        databaseModels: insertStats.databaseModels || null,
        pages: insertStats.pages || null
      };
      this.projectStats.set(id, stats);
      return stats;
    }
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByNgo(ngoId: number): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values()).filter(task => task.postedBy === ngoId);
    // Sort by creation date (newest first)
    return tasks.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return dateB - dateA;
    });
  }

  async getTasksForVolunteer(volunteerId: number): Promise<Task[]> {
    // For now, return all tasks that are not completed
    return Array.from(this.tasks.values()).filter(task => task.status !== "Completed");
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      status: insertTask.status || "Not Started",
      hours: insertTask.hours || 1,
      appliedVolunteers: [],
      approvedVolunteers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const existing = this.tasks.get(id);
    if (!existing) {
      throw new Error("Task not found");
    }
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number | string): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const existing = this.tasks.get(numericId);
    if (!existing) {
      return false;
    }
    
    // Also delete related applications
    const applications = Array.from(this.taskApplications.values()).filter(app => app.taskId === numericId);
    applications.forEach(app => this.taskApplications.delete(app.id));
    
    this.tasks.delete(numericId);
    return true;
  }

  // Task application methods
  async getTaskApplications(taskId: number): Promise<TaskApplication[]> {
    return Array.from(this.taskApplications.values()).filter(app => app.taskId === taskId);
  }

  async getVolunteerApplications(volunteerId: number): Promise<TaskApplication[]> {
    return Array.from(this.taskApplications.values()).filter(app => app.volunteerId === volunteerId);
  }

  async createTaskApplication(insertApplication: InsertTaskApplication): Promise<TaskApplication> {
    const id = this.currentTaskApplicationId++;
    const application: TaskApplication = {
      ...insertApplication,
      id,
      status: insertApplication.status || "pending",
      appliedAt: new Date(),
      approvedAt: null
    };
    this.taskApplications.set(id, application);
    return application;
  }

  async updateTaskApplication(id: number, updates: Partial<InsertTaskApplication>): Promise<TaskApplication> {
    const existing = this.taskApplications.get(id);
    if (!existing) {
      throw new Error("Task application not found");
    }
    const updated: TaskApplication = {
      ...existing,
      ...updates,
      approvedAt: updates.status === "approved" ? new Date() : existing.approvedAt
    };
    this.taskApplications.set(id, updated);
    return updated;
  }

  // Review methods
  async getTaskReviews(taskId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.taskId === taskId);
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.revieweeId === userId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      comment: insertReview.comment || null,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  // Certificate methods
  async getCertificates(volunteerId: number): Promise<Certificate[]> {
    return Array.from(this.certificates.values()).filter(cert => cert.volunteerId === volunteerId);
  }

  async createCertificate(insertCertificate: InsertCertificate): Promise<Certificate> {
    const id = this.currentCertificateId++;
    const certificate: Certificate = {
      ...insertCertificate,
      id,
      certificateUrl: insertCertificate.certificateUrl || null,
      issuedAt: new Date()
    };
    this.certificates.set(id, certificate);
    return certificate;
  }
}

export const storage = new MemStorage();
