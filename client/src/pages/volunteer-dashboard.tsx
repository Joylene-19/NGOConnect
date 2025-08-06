"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import {
  Heart,
  Search,
  Users,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Star,
  Download,
  Eye,
  AlertCircle,
  User,
  Award,
  TrendingUp,
  Filter,
  Send,
  ExternalLink,
  Home,
  Bell,
  Settings,
  LogOut,
  Target,
  Activity,
  BarChart3,
  Plus,
  ArrowRight,
  BookOpen,
  Globe,
  Zap,
  Lock,
  FileCheck,
  UserCheck,
  Timer,
  CheckSquare,
  FileText
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  organization: string
  location: string
  date: string
  duration: string
  volunteers: number
  maxVolunteers: number
  skills: string[]
  urgency: "low" | "medium" | "high"
  category: string
  postedBy: string
  status: "open" | "in-progress" | "completed" | "cancelled"
  taskStatus: string
  createdAt: string
  updatedAt: string
  hasApplied?: boolean
  applicationStatus?: "pending" | "approved" | "rejected" | null
  applicationId?: string | null
}

interface Application {
  id: string
  taskId: string
  volunteerId: string
  status: "pending" | "approved" | "rejected"
  appliedAt: string
  motivation: string
  task: {
    id: string
    title: string
    description: string
    location: string
    date: string
    duration: string
    skills: string[]
    category: string
    status: string
    organization: string
  }
}

interface Certificate {
  id: string
  taskTitle: string
  ngoName: string
  issuedAt: string
  certificateUrl: string
  hours: number
}

interface Review {
  id: string
  taskId: string
  taskTitle: string
  revieweeId: string
  revieweeName: string
  revieweeRole: string
  canReview: boolean
}

interface TaskTracking {
  id: string
  taskId: string
  applicationId: string
  volunteerId: string
  status: "upcoming" | "in-progress" | "completed" | "verification" | "verified" | "certificate-requested" | "certificate-issued"
  taskDate: string
  attendanceMarked: boolean
  attendanceTime?: string
  verificationDate?: string
  certificateRequestDate?: string
  certificateIssuedDate?: string
  certificateUrl?: string
  task: {
    id: string
    title: string
    description: string
    organization: string
    location: string
    duration: string
    category: string
  }
}

interface CertificateTemplate {
  id: string
  ngoId: string
  templateUrl: string
  name: string
  placeholders: string[] // ["<name>", "<activity>", "<hours>", "<date>"]
}

export default function VolunteerDashboard() {
  const { user, logout } = useAuth()
  const [availableTasks, setAvailableTasks] = useState<Task[]>([])
  const [myApplications, setMyApplications] = useState<Application[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [pendingReviews, setPendingReviews] = useState<Review[]>([])
  const [taskTracking, setTaskTracking] = useState<TaskTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"home" | "browse" | "applications" | "certificates" | "reviews" | "tracking">("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [applicationMotivation, setApplicationMotivation] = useState("")
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  
  // Enhanced filtering state
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    urgency: "",
    duration: "",
    skills: [] as string[],
    dateRange: ""
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("date") // date, urgency, location, volunteers
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<Application[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [profileCompleteness, setProfileCompleteness] = useState(75)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: '',
    description: '',
    skills: [],
    phone: '',
    location: '',
    profilePhoto: null as File | null,
    profilePhotoUrl: ''
  })
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: ''
  })

  useEffect(() => {
    if (user && user.role === "volunteer") {
      fetchAvailableTasks()
      fetchMyApplications()
      fetchCertificates()
      fetchPendingReviews()
      fetchAnnouncements()
      fetchUpcomingTasks()
      fetchRecentActivity()
    }
  }, [user])

  // Update task tracking when applications change
  useEffect(() => {
    if (myApplications.length > 0) {
      fetchTaskTracking()
    }
  }, [myApplications])

  // Auto-refresh applications every 30 seconds to catch NGO updates
  useEffect(() => {
    if (user && user.role === "volunteer") {
      const interval = setInterval(() => {
        fetchMyApplications()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [user])

  const fetchAvailableTasks = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tasks/available", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch available tasks")
      }

      const data = await response.json()
      setAvailableTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/my-applications", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }

      const data = await response.json()
      
      // Load any persisted application updates from localStorage (from NGO dashboard)
      const applicationUpdates = JSON.parse(localStorage.getItem("applicationUpdates") || "{}")
      
      // Apply updates from NGO actions to volunteer's view
      const updatedData = data.map((app: Application) => {
        if (applicationUpdates[app.id]) {
          return { ...app, ...applicationUpdates[app.id] }
        }
        return app
      })
      
      setMyApplications(updatedData)
      console.log("✅ Applications fetched and updated:", updatedData)
    } catch (err) {
      console.error("Failed to fetch applications:", err)
      
      // Load mock data with any persisted updates
      const applicationUpdates = JSON.parse(localStorage.getItem("applicationUpdates") || "{}")
      
      // Mock applications that would come from the backend
      const mockApplications: Application[] = [
        {
          id: "app-1",
          taskId: "task-1",
          volunteerId: user?.id || "vol-1",
          status: "pending",
          appliedAt: "2024-01-10T10:00:00Z",
          motivation: "instrested",
          task: {
            id: "task-1",
            title: "test activity",
            description: "Help clean up the local beach",
            location: "Mumbai", 
            category: "Environment",
            status: "open",
            organization: "Ocean Guardians",
            date: "2025-07-15",
            duration: "4 hours",
            skills: ["Environmental Science"]
          }
        }
      ]
      
      // Apply local updates to mock data
      const updatedMockData = mockApplications.map(app => {
        if (applicationUpdates[app.id]) {
          return { ...app, ...applicationUpdates[app.id] }
        }
        return app
      })
      
      setMyApplications(updatedMockData)
      console.log("✅ Mock applications loaded with updates:", updatedMockData)
    }
  }

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/certificates/my", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Transform the data to match the expected Certificate interface
        const transformedCertificates: Certificate[] = data.map((cert: any) => ({
          id: cert.id,
          taskTitle: cert.taskTitle,
          ngoName: cert.ngoName,
          issuedAt: cert.generatedAt,
          certificateUrl: `/api/certificates/download/${cert.id}`,
          hours: cert.hoursCompleted
        }))
        setCertificates(transformedCertificates)
      } else {
        console.error("Failed to fetch certificates")
        // Fallback to empty array
        setCertificates([])
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", err)
      setCertificates([])
    }
  }

  const fetchPendingReviews = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/my-pending-reviews", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch pending reviews")
      }

      const data = await response.json()
      setPendingReviews(data)
    } catch (err) {
      console.error("Failed to fetch pending reviews:", err)
    }
  }

  const fetchTaskTracking = async () => {
    try {
      // Get approved applications and create tracking entries
      const approvedApplications = myApplications.filter(app => app.status === "approved")
      
      // Generate tracking entries for approved applications
      const trackingEntries: TaskTracking[] = approvedApplications.map(app => {
        const taskDate = new Date(app.task.date || Date.now() + 7 * 24 * 60 * 60 * 1000)
        const today = new Date()
        const diffTime = taskDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        // Determine status based on task date
        let status: "upcoming" | "in-progress" | "completed" | "verification" | "verified" | "certificate-requested" | "certificate-issued"
        
        if (diffDays > 1) {
          status = "upcoming"
        } else if (diffDays >= 0 && diffDays <= 1) {
          status = "in-progress"
        } else if (diffDays < 0 && diffDays >= -2) {
          status = "completed"
        } else {
          status = "verification"
        }
        
        return {
          id: `track-${app.id}`,
          taskId: app.taskId,
          applicationId: app.id,
          volunteerId: app.volunteerId,
          status: status,
          taskDate: app.task.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          attendanceMarked: false,
          task: {
            id: app.task.id,
            title: app.task.title,
            description: app.task.description,
            organization: app.task.organization,
            location: app.task.location,
            duration: app.task.duration,
            category: app.task.category
          }
        }
      })
      
      // Add some mock tracking entries for demo purposes (keep for now)
      const mockTracking: TaskTracking[] = [
        {
          id: "track-demo-1",
          taskId: "task-demo-1",
          applicationId: "app-demo-1",
          volunteerId: user?.id || "vol-1",
          status: "verification",
          taskDate: "2025-07-08",
          attendanceMarked: true,
          attendanceTime: "2025-07-08T09:00:00Z",
          task: {
            id: "task-demo-1",
            title: "Food Bank Volunteer",
            description: "Sort and distribute food to families in need",
            organization: "City Food Bank",
            location: "Downtown Community Center",
            duration: "6 hours",
            category: "Community"
          }
        }
      ]
      
      // Combine approved applications with mock data
      const allTrackingEntries = [...trackingEntries, ...mockTracking]
      
      setTaskTracking(allTrackingEntries)
      console.log("✅ Task tracking updated with approved applications:", {
        approvedCount: approvedApplications.length,
        trackingEntries: trackingEntries.length,
        totalTracking: allTrackingEntries.length
      })
    } catch (err) {
      console.error("Failed to fetch task tracking:", err)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      // Mock announcements for now
      const mockAnnouncements = [
        {
          id: "ann-1",
          title: "New Environmental Tasks Available!",
          message: "We've added 5 new tree planting opportunities in your area. Apply now!",
          type: "info",
          date: new Date().toISOString(),
          priority: "high"
        },
        {
          id: "ann-2", 
          title: "Volunteer Training Workshop",
          message: "Join us for a virtual training session on community engagement this Saturday.",
          type: "event",
          date: new Date().toISOString(),
          priority: "medium"
        }
      ]
      setAnnouncements(mockAnnouncements)
    } catch (err) {
      console.error("Failed to fetch announcements:", err)
    }
  }

  const fetchUpcomingTasks = async () => {
    try {
      // Get approved applications with future dates
      const approved = myApplications.filter(app => app.status === "approved")
      setUpcomingTasks(approved.slice(0, 3)) // Show next 3 upcoming tasks
    } catch (err) {
      console.error("Failed to fetch upcoming tasks:", err)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Mock recent activity
      const mockActivity = [
        {
          id: "act-1",
          type: "application",
          message: "Applied to Beach Cleanup Drive",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          icon: Send
        },
        {
          id: "act-2",
          type: "approval",
          message: "Application approved for Food Bank Volunteer",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          icon: CheckCircle
        },
        {
          id: "act-3",
          type: "certificate",
          message: "Received certificate for Tree Planting Initiative",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          icon: Award
        }
      ]
      setRecentActivity(mockActivity)
    } catch (err) {
      console.error("Failed to fetch recent activity:", err)
    }
  }

  // Task Lifecycle Management Functions
  const requestCertificate = async (trackingId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/task-tracking/${trackingId}/request-certificate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to request certificate")
      }

      // Update local state
      setTaskTracking(prev => prev.map(track => 
        track.id === trackingId 
          ? { ...track, status: "certificate-requested", certificateRequestDate: new Date().toISOString() }
          : track
      ))

      // Show success message
      setError(null)
      // In a real app, you might want to show a success toast notification
      console.log("Certificate requested successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request certificate")
    }
  }

  const sendEmailNotification = async (type: string, trackingId: string) => {
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/notifications/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          trackingId,
          volunteerId: user?.id
        })
      })
    } catch (err) {
      console.error("Failed to send email notification:", err)
    }
  }

  const updateTaskStatus = () => {
    // Auto-update task statuses based on dates and conditions
    const currentDate = new Date()
    
    setTaskTracking(prev => prev.map(track => {
      const taskDate = new Date(track.taskDate)
      
      // If task date has passed and status is upcoming, move to completed
      if (track.status === "upcoming" && taskDate < currentDate) {
        // Send notification about task completion
        sendEmailNotification("task-completed", track.id)
        return { ...track, status: "completed" }
      }
      
      // If task is on same day, mark as in-progress
      if (track.status === "upcoming" && taskDate.toDateString() === currentDate.toDateString()) {
        return { ...track, status: "in-progress" }
      }
      
      return track
    }))
  }

  // Simulate NGO attendance marking (this would normally come from NGO dashboard)
  const simulateAttendanceCheck = () => {
    setTaskTracking(prev => prev.map(track => {
      // Auto-mark attendance for completed tasks after 2 hours (simulation)
      if (track.status === "completed" && !track.attendanceMarked) {
        const completionTime = new Date(track.taskDate)
        completionTime.setHours(completionTime.getHours() + 2)
        
        if (new Date() > completionTime) {
          return {
            ...track,
            attendanceMarked: true,
            attendanceTime: new Date().toISOString(),
            status: "verification"
          }
        }
      }
      
      // Auto-verify after attendance is marked (simulation of NGO approval)
      if (track.status === "verification" && track.attendanceMarked) {
        const verificationTime = new Date(track.attendanceTime!)
        verificationTime.setHours(verificationTime.getHours() + 1)
        
        if (new Date() > verificationTime) {
          return {
            ...track,
            status: "verified",
            verificationDate: new Date().toISOString()
          }
        }
      }
      
      return track
    }))
  }

  // Call updateTaskStatus periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updateTaskStatus()
      simulateAttendanceCheck()
    }, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const submitReview = async () => {
    if (!selectedReview || reviewData.rating === 0 || !reviewData.comment.trim()) {
      setError("Please provide a rating and comment")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: selectedReview.taskId,
          taskTitle: selectedReview.taskTitle,
          revieweeId: selectedReview.revieweeId,
          revieweeName: selectedReview.revieweeName,
          revieweeRole: selectedReview.revieweeRole,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      // Remove from pending reviews
      setPendingReviews(prev => prev.filter(r => r.id !== selectedReview.id))
      
      // Reset form and close modal
      setShowReviewModal(false)
      setSelectedReview(null)
      setReviewData({rating: 0, comment: ''})
      setError(null)
      
      // Show success message (in real app, use toast notification)
      console.log("Review submitted successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review")
    }
  }

  const handleApplyToTask = async (task: Task) => {
    if (!applicationMotivation.trim()) {
      setError("Please provide a motivation message")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tasks/${task.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          motivation: applicationMotivation
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to apply to task")
      }

      // Update the task in available tasks
      setAvailableTasks(prev => 
        prev.map(t => 
          t.id === task.id 
            ? { ...t, hasApplied: true, applicationStatus: "pending" }
            : t
        )
      )

      // Refresh applications
      await fetchMyApplications()

      // Create tracking entry for approved applications
      const newTracking: TaskTracking = {
        id: `track-${Date.now()}`,
        taskId: task.id,
        applicationId: `app-${Date.now()}`,
        volunteerId: user?.id || "",
        status: "upcoming",
        taskDate: task.date,
        attendanceMarked: false,
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          organization: task.organization,
          location: task.location,
          duration: task.duration,
          category: task.category
        }
      }
      
      setTaskTracking(prev => [...prev, newTracking])

      // Reset form
      setApplicationMotivation("")
      setShowApplicationForm(false)
      setSelectedTask(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply to task")
    }
  }

  const handleLogout = async () => {
    try {
      console.log("🔄 Volunteer dashboard logout clicked");
      logout()
      console.log("✅ Volunteer dashboard logout completed");
      // The AuthContext will handle navigation to /login
    } catch (err) {
      console.error("❌ Logout failed:", err)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "low":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getTrackingStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "verification":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "verified":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "certificate-requested":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "certificate-issued":
        return "bg-violet-100 text-violet-800 border-violet-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusOrder = (status: string) => {
    const statusOrder = {
      "upcoming": 0,
      "in-progress": 1,
      "completed": 2,
      "verification": 3,
      "verified": 4,
      "certificate-requested": 5,
      "certificate-issued": 6
    }
    return statusOrder[status as keyof typeof statusOrder] || 0
  }

  const getTimeUntilTask = (taskDate: string) => {
    const now = new Date()
    const task = new Date(taskDate)
    const diffInMs = task.getTime() - now.getTime()
    
    if (diffInMs <= 0) return "Today"
    
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} left`
    } else {
      return "Starting soon"
    }
  }

  // Enhanced filtering and sorting
  const filteredAndSortedTasks = availableTasks
    .filter(task => {
      // Basic search filter
      const matchesSearch = !searchQuery || (
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      
      // Advanced filters
      const matchesCategory = !filters.category || task.category === filters.category
      const matchesLocation = !filters.location || task.location.toLowerCase().includes(filters.location.toLowerCase())
      const matchesUrgency = !filters.urgency || task.urgency === filters.urgency
      const matchesDuration = !filters.duration || task.duration.includes(filters.duration)
      const matchesSkills = filters.skills.length === 0 || filters.skills.some(skill => 
        task.skills.some(taskSkill => taskSkill.toLowerCase().includes(skill.toLowerCase()))
      )
      
      // Date range filter
      const matchesDateRange = !filters.dateRange || (() => {
        const taskDate = new Date(task.date)
        const today = new Date()
        switch (filters.dateRange) {
          case "today":
            return taskDate.toDateString() === today.toDateString()
          case "week":
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
            return taskDate >= today && taskDate <= weekFromNow
          case "month":
            const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
            return taskDate >= today && taskDate <= monthFromNow
          default:
            return true
        }
      })()
      
      return matchesSearch && matchesCategory && matchesLocation && matchesUrgency && matchesDuration && matchesSkills && matchesDateRange
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "urgency":
          const urgencyOrder = { high: 3, medium: 2, low: 1 }
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
        case "location":
          return a.location.localeCompare(b.location)
        case "volunteers":
          return (b.maxVolunteers - b.volunteers) - (a.maxVolunteers - a.volunteers)
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  // Keep backward compatibility
  const filteredTasks = filteredAndSortedTasks

  // Helper functions for filter options
  const getUniqueOptions = (field: keyof Task) => {
    return [...new Set(availableTasks.map(task => task[field] as string))]
  }

  const uniqueCategories = getUniqueOptions('category')
  const uniqueLocations = getUniqueOptions('location')
  const uniqueSkills = [...new Set(availableTasks.flatMap(task => task.skills))]

  const clearFilters = () => {
    setFilters({
      category: "",
      location: "",
      urgency: "",
      duration: "",
      skills: [],
      dateRange: ""
    })
    setSearchQuery("")
  }

  const stats = {
    totalApplications: myApplications.length,
    approvedApplications: myApplications.filter(app => app.status === "approved").length,
    pendingApplications: myApplications.filter(app => app.status === "pending").length,
    totalCertificates: certificates.length,
    totalHours: certificates.reduce((acc, cert) => acc + cert.hours, 0),
    pendingReviewsCount: pendingReviews.length,
    // Task tracking stats
    upcomingTasks: taskTracking.filter(track => track.status === "upcoming").length,
    completedTasks: taskTracking.filter(track => track.status === "completed").length,
    verificationPending: taskTracking.filter(track => track.status === "verification").length,
    certificateRequests: taskTracking.filter(track => track.status === "certificate-requested").length
  }

  if (loading && availableTasks.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "volunteer") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">Only volunteer accounts can access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-emerald-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Volunteer Hub
                </h1>
                <p className="text-sm text-slate-600 font-medium">Welcome back, {user?.name} 👋</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Profile Completeness */}
              <Button
                variant="ghost"
                className="hidden md:flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                onClick={() => setShowProfile(true)}
              >
                <Target className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Profile</p>
                  <p className="text-sm font-bold text-emerald-800">{profileCompleteness}% Complete</p>
                </div>
              </Button>

              {/* Hours Badge */}
              <div className="bg-gradient-to-r from-teal-100 to-cyan-100 px-4 py-2 rounded-xl border border-teal-200">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-800">{stats.totalHours} hours</span>
                </div>
              </div>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-emerald-50"
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {announcements.length}
                  </span>
                )}
              </Button>

              {/* Settings */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-emerald-50"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-5 w-5 text-slate-600" />
              </Button>

              {/* Logout Button */}
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm" 
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold text-white">{stats.totalApplications}</p>
                  <p className="text-emerald-200 text-xs mt-1">
                    {stats.pendingApplications} pending
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Send className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">Approved Tasks</p>
                  <p className="text-3xl font-bold text-white">{stats.approvedApplications}</p>
                  <p className="text-teal-200 text-xs mt-1">
                    {Math.round((stats.approvedApplications / Math.max(stats.totalApplications, 1)) * 100)}% success rate
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Certificates Earned</p>
                  <p className="text-3xl font-bold text-white">{stats.totalCertificates}</p>
                  <p className="text-purple-200 text-xs mt-1">
                    Digital achievements
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Award className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">Hours Contributed</p>
                  <p className="text-3xl font-bold text-white">{stats.totalHours}</p>
                  <p className="text-cyan-200 text-xs mt-1">
                    Making a difference
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-emerald-100">
            <nav className="flex space-x-2">
              {[
                { id: "home", label: "Dashboard Home", icon: Home },
                { id: "browse", label: "Browse Tasks", icon: Search },
                { id: "applications", label: "My Applications", icon: Send },
                { id: "tracking", label: "Task Tracking", icon: Activity },
                { id: "certificates", label: "Certificates", icon: Award },
                { id: "reviews", label: "Reviews", icon: Star }
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                // Define colors for each tab
                const getTabClasses = () => {
                  if (isActive) {
                    switch (tab.id) {
                      case "home":
                        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                      case "browse":
                        return "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
                      case "applications":
                        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      case "tracking":
                        return "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg"
                      case "certificates":
                        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                      case "reviews":
                        return "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                      default:
                        return "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg"
                    }
                  } else {
                    switch (tab.id) {
                      case "home":
                        return "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-sm"
                      case "browse":
                        return "text-slate-600 hover:bg-teal-50 hover:text-teal-600 hover:shadow-sm"
                      case "applications":
                        return "text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm"
                      case "tracking":
                        return "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm"
                      case "certificates":
                        return "text-slate-600 hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm"
                      case "reviews":
                        return "text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:shadow-sm"
                      default:
                        return "text-slate-600 hover:bg-slate-50 hover:text-slate-700 hover:shadow-sm"
                    }
                  }
                }
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${getTabClasses()}`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.id === "applications" && stats.pendingApplications > 0 && (
                      <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.pendingApplications}
                      </Badge>
                    )}
                    {tab.id === "tracking" && stats.verificationPending > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.verificationPending}
                      </Badge>
                    )}
                    {tab.id === "reviews" && stats.pendingReviewsCount > 0 && (
                      <Badge className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.pendingReviewsCount}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
        {/* Content Based on Active Tab */}
        {activeTab === "home" && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Dashboard Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Overview */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-emerald-800">
                      <TrendingUp className="h-5 w-5" />
                      <span>Your Impact Journey</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                        <Target className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-emerald-800">{stats.totalApplications}</p>
                        <p className="text-sm text-slate-600">Applications</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                        <CheckCircle className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-teal-800">{stats.approvedApplications}</p>
                        <p className="text-sm text-slate-600">Approved</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-800">{stats.totalHours}</p>
                        <p className="text-sm text-slate-600">Hours</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                        <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-800">{stats.totalCertificates}</p>
                        <p className="text-sm text-slate-600">Certificates</p>
                      </div>
                    </div>

                    {/* Profile Completeness Bar */}
                    <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Profile Completeness</span>
                        <span className="text-sm font-bold text-emerald-600">{profileCompleteness}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${profileCompleteness}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Complete your profile to get better task recommendations</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Tasks */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-teal-600" />
                        <span>Upcoming Tasks</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("applications")}>
                        <ArrowRight className="h-4 w-4 ml-2" />
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingTasks.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingTasks.map((task) => (
                          <div key={task.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                              <Globe className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{task.task.title}</h4>
                              <p className="text-sm text-slate-600">{task.task.organization}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-teal-600 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {task.task.location}
                                </span>
                                <span className="text-xs text-teal-600 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.task.duration}
                                </span>
                              </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No upcoming tasks yet</p>
                        <Button 
                          variant="outline" 
                          className="mt-4" 
                          onClick={() => setActiveTab("browse")}
                        >
                          Browse Available Tasks
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-blue-800">
                      <Zap className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => setActiveTab("browse")} 
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Find New Tasks
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("applications")}
                      className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      My Applications
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("certificates")}
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      View Certificates
                    </Button>
                  </CardContent>
                </Card>

                {/* Announcements */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-amber-600" />
                      <span>Announcements</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {announcements.length > 0 ? (
                      <div className="space-y-3">
                        {announcements.map((announcement) => (
                          <div key={announcement.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-amber-800 text-sm">{announcement.title}</h4>
                            <p className="text-xs text-amber-700 mt-1">{announcement.message}</p>
                            <p className="text-xs text-amber-600 mt-2">
                              {new Date(announcement.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No new announcements</p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-indigo-600" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((activity) => {
                        const Icon = activity.icon
                        return (
                          <div key={activity.id} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <Icon className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-800">{activity.message}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(activity.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        {activeTab === "browse" && (
          <div className="space-y-6">
            {/* Enhanced Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Search and Filter Toggle */}
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by title, organization, location, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className={showFilters ? "bg-emerald-50 border-emerald-200" : ""}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f) && (
                        <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </Button>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="urgency">Urgency</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="volunteers">Spots Available</SelectItem>
                        <SelectItem value="alphabetical">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                          <Label className="text-sm font-medium">Category</Label>
                          <Select 
                            value={filters.category} 
                            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any category</SelectItem>
                              {uniqueCategories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Location Filter */}
                        <div>
                          <Label className="text-sm font-medium">Location</Label>
                          <Input
                            placeholder="Filter by location"
                            value={filters.location}
                            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>

                        {/* Urgency Filter */}
                        <div>
                          <Label className="text-sm font-medium">Urgency</Label>
                          <Select 
                            value={filters.urgency} 
                            onValueChange={(value) => setFilters(prev => ({ ...prev, urgency: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any urgency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any urgency</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                          <Label className="text-sm font-medium">Date Range</Label>
                          <Select 
                            value={filters.dateRange} 
                            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Any time</SelectItem>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="week">Next 7 days</SelectItem>
                              <SelectItem value="month">Next 30 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Clear Filters and Results Count */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-slate-600">
                          {filteredTasks.length} of {availableTasks.length} opportunities
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearFilters}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">{task.title}</h3>
                          <p className="text-teal-600 font-medium text-sm">{task.organization}</p>
                          <p className="text-slate-600 text-sm mt-2 line-clamp-2">{task.description}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getUrgencyColor(task.urgency)}>{task.urgency}</Badge>
                          {task.hasApplied && (
                            <Badge className={getApplicationStatusColor(task.applicationStatus || "")}>
                              {task.applicationStatus}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{task.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{task.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{task.volunteers}/{task.maxVolunteers} volunteers</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {task.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {task.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <Badge variant="outline">{task.category}</Badge>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-slate-50 hover:border-slate-300"
                            title="View task details"
                            onClick={() => {
                              setSelectedTaskForDetails(task)
                              setShowTaskDetails(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!task.hasApplied ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedTask(task)
                                setShowApplicationForm(true)
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              Apply Now
                            </Button>
                          ) : (
                            <Button size="sm" disabled variant="outline">
                              Applied
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTasks.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">No tasks found</h3>
                  <p className="text-slate-600">Try adjusting your search or check back later for new opportunities.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">My Applications</h2>

            {myApplications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Send className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">No applications yet</h3>
                  <p className="text-slate-600 mb-4">Start by applying to volunteer opportunities.</p>
                  <Button onClick={() => setActiveTab("browse")}>
                    Browse Tasks
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="font-semibold text-slate-900">{application.task.title}</h4>
                            <Badge className={getApplicationStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </div>

                          <p className="text-teal-600 font-medium text-sm mb-2">{application.task.organization}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{application.task.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{application.task.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {application.motivation && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-slate-700 mb-1">Your motivation:</p>
                              <p className="text-slate-600 text-sm bg-slate-50 rounded-lg p-3">
                                {application.motivation}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {application.task.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-slate-50 hover:border-slate-300"
                            title="View application details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">My Certificates</h2>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {stats.totalHours} total hours
              </Badge>
            </div>

            {certificates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">No certificates yet</h3>
                  <p className="text-slate-600">Complete volunteer tasks to earn certificates.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((certificate) => (
                  <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto">
                          <Award className="h-8 w-8 text-purple-600" />
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-900 mb-1">{certificate.taskTitle}</h3>
                          <p className="text-teal-600 text-sm">{certificate.ngoName}</p>
                        </div>

                        <div className="flex justify-center space-x-4 text-sm text-slate-500">
                          <div className="text-center">
                            <p className="font-medium text-slate-900">{certificate.hours}</p>
                            <p>Hours</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-slate-900">
                              {new Date(certificate.issuedAt).toLocaleDateString()}
                            </p>
                            <p>Issued</p>
                          </div>
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          asChild
                        >
                          <a href={certificate.certificateUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Task Tracking Tab */}
        {activeTab === "tracking" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Task Tracking</h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  {taskTracking.length} total tasks
                </Badge>
              </div>
            </div>

            {/* Task Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Upcoming</p>
                      <p className="text-2xl font-bold text-blue-800">{stats.upcomingTasks}</p>
                      <p className="text-xs text-blue-600 mt-1">Tasks scheduled</p>
                    </div>
                    <Timer className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Completed</p>
                      <p className="text-2xl font-bold text-green-800">{stats.completedTasks}</p>
                      <p className="text-xs text-green-600 mt-1">Tasks finished</p>
                    </div>
                    <CheckSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-600 text-sm font-medium">Verification</p>
                      <p className="text-2xl font-bold text-amber-800">{stats.verificationPending}</p>
                      <p className="text-xs text-amber-600 mt-1">Awaiting NGO</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Certificates</p>
                      <p className="text-2xl font-bold text-purple-800">{stats.certificateRequests}</p>
                      <p className="text-xs text-purple-600 mt-1">Requested/Issued</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lifecycle Automation Info */}
            <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-indigo-900">Automated Task Lifecycle</h3>
                    <p className="text-sm text-indigo-700">
                      Tasks automatically progress through: Application → Upcoming → Completed → Verification → Certificate Ready
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {taskTracking.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">No tracked tasks yet</h3>
                  <p className="text-slate-600 mb-4">Your approved applications will appear here for tracking.</p>
                  <Button onClick={() => setActiveTab("browse")}>
                    Browse Tasks
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {taskTracking.map((track) => (
                  <Card key={track.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-slate-900">{track.task.title}</h4>
                            <Badge className={getTrackingStatusColor(track.status)}>
                              {track.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-teal-600 font-medium text-sm mb-2">{track.task.organization}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500 mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{track.task.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{track.task.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(track.taskDate).toLocaleDateString()}</span>
                              {track.status === "upcoming" && (
                                <span className="text-blue-600 font-medium">
                                  ({getTimeUntilTask(track.taskDate)})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Timeline */}
                          <div className="bg-slate-50 rounded-lg p-4">
                            <h5 className="font-medium text-slate-700 mb-3">Progress Timeline</h5>
                            <div className="flex items-center space-x-4">
                              {[
                                { status: "upcoming", label: "Upcoming", icon: Timer },
                                { status: "completed", label: "Completed", icon: CheckSquare },
                                { status: "verification", label: "Verification", icon: UserCheck },
                                { status: "verified", label: "Verified", icon: CheckCircle },
                                { status: "certificate-requested", label: "Cert. Requested", icon: FileText },
                                { status: "certificate-issued", label: "Certificate", icon: Award }
                              ].map((step, index) => {
                                const StepIcon = step.icon
                                const isCompleted = getStatusOrder(track.status) >= getStatusOrder(step.status)
                                const isCurrent = track.status === step.status
                                
                                return (
                                  <div key={step.status} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      isCompleted 
                                        ? 'bg-emerald-500 text-white' 
                                        : isCurrent 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-slate-200 text-slate-400'
                                    }`}>
                                      <StepIcon className="h-4 w-4" />
                                    </div>
                                    {index < 5 && (
                                      <div className={`w-8 h-1 ${
                                        getStatusOrder(track.status) > getStatusOrder(step.status) 
                                          ? 'bg-emerald-500' 
                                          : 'bg-slate-200'
                                      }`} />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="text-sm text-slate-500">
                          {track.attendanceMarked && (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Attendance confirmed
                            </span>
                          )}
                          {track.status === "verification" && !track.attendanceMarked && (
                            <span className="text-amber-600 flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Waiting for NGO verification
                            </span>
                          )}
                          {track.certificateRequestDate && (
                            <span className="text-purple-600 flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Certificate requested on {new Date(track.certificateRequestDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {track.status === "verified" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                requestCertificate(track.id)
                                sendEmailNotification("certificate-request", track.id)
                              }}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Request Certificate
                            </Button>
                          )}
                          {track.status === "certificate-requested" && (
                            <Button
                              size="sm"
                              disabled
                              variant="outline"
                              className="text-purple-600 border-purple-200"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Processing...
                            </Button>
                          )}
                          {track.status === "certificate-issued" && track.certificateUrl && (
                            <Button
                              size="sm"
                              asChild
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <a href={track.certificateUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Download Certificate
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-slate-50 hover:border-slate-300"
                            title="View tracking details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Pending Reviews</h2>

            {pendingReviews.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Star className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-900 mb-2">No pending reviews</h3>
                  <p className="text-slate-600">Reviews will appear here when you complete tasks.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-2">{review.taskTitle}</h4>
                          <p className="text-slate-600 text-sm mb-1">
                            Review {review.revieweeName} ({review.revieweeRole})
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-amber-600 hover:bg-amber-700"
                          onClick={() => {
                            setSelectedReview(review)
                            setShowReviewModal(true)
                          }}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Write Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Application Form Modal */}
      {showApplicationForm && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Apply for {selectedTask.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">{selectedTask.organization}</p>
                <p className="text-sm text-slate-500">{selectedTask.location}</p>
              </div>

              <div>
                <Label htmlFor="motivation">Why do you want to volunteer for this task? *</Label>
                <Textarea
                  id="motivation"
                  value={applicationMotivation}
                  onChange={(e) => setApplicationMotivation(e.target.value)}
                  placeholder="Tell the organization why you're interested and what you can contribute..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplicationForm(false)
                    setSelectedTask(null)
                    setApplicationMotivation("")
                    setError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApplyToTask(selectedTask)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={!applicationMotivation.trim()}
                >
                  Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-600" />
              Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-amber-900">{announcement.title}</h4>
                      <p className="text-sm text-amber-700 mt-1">{announcement.message}</p>
                      <p className="text-xs text-amber-600 mt-2">{announcement.date}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No new notifications</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" />
              Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Email notifications</span>
                  <Button variant="outline" size="sm">Toggle</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Task reminders</span>
                  <Button variant="outline" size="sm">Toggle</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Weekly digest</span>
                  <Button variant="outline" size="sm">Toggle</Button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Account</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              My Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Profile Photo Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.profilePhotoUrl} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl font-bold">
                  {profileData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG or GIF (max 5MB)</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                placeholder="City, State/Country"
              />
            </div>

            {/* Bio/Description */}
            <div>
              <Label htmlFor="description">Bio</Label>
              <Textarea
                id="description"
                value={profileData.description}
                onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                placeholder="Tell us about yourself, your interests, and why you volunteer..."
                rows={4}
              />
            </div>

            {/* Skills */}
            <div>
              <Label htmlFor="skills">Skills & Interests</Label>
              <Input
                id="skills"
                value={profileData.skills.join(', ')}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                placeholder="e.g., Teaching, Healthcare, Environmental, Technology..."
              />
              <p className="text-xs text-slate-500 mt-1">Separate skills with commas</p>
            </div>

            {/* Profile Completeness */}
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-emerald-700">Profile Completeness</span>
                <span className="text-sm font-bold text-emerald-800">{profileCompleteness}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${profileCompleteness}%`}}
                ></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfile(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              Write Review
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-slate-900">{selectedReview.taskTitle}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Reviewing: {selectedReview.revieweeName} ({selectedReview.revieweeRole})
                </p>
              </div>

              {/* Rating */}
              <div>
                <Label>Overall Rating</Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant="ghost"
                      size="sm"
                      className="p-1"
                      onClick={() => setReviewData({...reviewData, rating})}
                    >
                      <Star 
                        className={`h-6 w-6 ${
                          rating <= reviewData.rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </Button>
                  ))}
                  <span className="ml-2 text-sm text-slate-600">
                    {reviewData.rating}/5 stars
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="reviewComment">Your Review</Label>
                <Textarea
                  id="reviewComment"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  placeholder="Share your experience working with this person..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReviewModal(false)
              setSelectedReview(null)
              setReviewData({rating: 0, comment: ''})
            }}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              disabled={reviewData.rating === 0 || !reviewData.comment.trim()}
              onClick={submitReview}
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Modal */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-teal-600" />
              Task Details
            </DialogTitle>
          </DialogHeader>
          {selectedTaskForDetails && (
            <div className="space-y-6">
              {/* Task Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">{selectedTaskForDetails.title}</h3>
                  <Badge className={getUrgencyColor(selectedTaskForDetails.urgency)}>
                    {selectedTaskForDetails.urgency} priority
                  </Badge>
                </div>
                <p className="text-teal-600 font-medium">{selectedTaskForDetails.organization}</p>
              </div>

              {/* Task Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{selectedTaskForDetails.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{selectedTaskForDetails.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{selectedTaskForDetails.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{selectedTaskForDetails.volunteers}/{selectedTaskForDetails.maxVolunteers} volunteers</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                <p className="text-slate-700 leading-relaxed">{selectedTaskForDetails.description}</p>
              </div>

              {/* Skills Required */}
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Skills Required</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTaskForDetails.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Category</h4>
                <Badge variant="outline" className="text-sm">{selectedTaskForDetails.category}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDetails(false)}>
              Close
            </Button>
            {selectedTaskForDetails && !selectedTaskForDetails.hasApplied && (
              <Button 
                onClick={() => {
                  setSelectedTask(selectedTaskForDetails)
                  setShowApplicationForm(true)
                  setShowTaskDetails(false)
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Apply to Task
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
