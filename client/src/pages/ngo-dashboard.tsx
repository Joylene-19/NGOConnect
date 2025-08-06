import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  Award,
  TrendingUp,
  BarChart3,
  Heart,
  Target,
  Bell,
  Settings,
  LogOut,
  Building2,
  Activity,
  FileText
} from 'lucide-react'
import CreateTaskForm from '@/components/CreateTaskForm'

interface Task {
  id: string
  title: string
  description: string
  location: string
  date: string
  requiredSkills: string[]
  status: 'open' | 'in-progress' | 'completed'
  maxVolunteers: number
  appliedVolunteers: string[]
  approvedVolunteers: string[]
  category: string
  urgency: 'low' | 'medium' | 'high'
  createdAt: string
}

interface Application {
  id: string
  taskId: string
  volunteerId: string
  volunteerName: string
  volunteerEmail: string
  volunteerSkills: string[]
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: string
  taskTitle: string
  taskDate?: string
  task?: {
    id: string
    title: string
    description: string
    location: string
    category: string
    status: string
    date: string
  }
  volunteer?: {
    id: string
    name: string
    email: string
  }
}

interface DashboardStats {
  totalTasks: number
  activeTasks: number
  completedTasks: number
  totalVolunteers: number
  pendingApplications: number
}

interface AttendanceRecord {
  volunteerId: string
  volunteerName: string
  volunteerEmail: string
  attendanceStatus: 'present' | 'absent' | 'pending'
  hoursCompleted: number
  markedAt: string | null
  attendanceId: string | null
  trackingStatus?: 'Completed' | 'In Progress' | 'Not Started';
}

interface TaskAttendance {
  taskId: string
  taskTitle: string
  taskDate: string
  volunteers: AttendanceRecord[]
}

interface Certificate {
  id: string
  certificateNumber: string
  taskId: string
  taskTitle: string
  volunteerId: string
  volunteerName: string
  hoursCompleted: number
  generatedAt: string
  downloadedAt: string | null
  status: 'generated' | 'downloaded'
}

export default function NGODashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [tasks, setTasks] = useState<Task[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalVolunteers: 0,
    pendingApplications: 0
  })
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Attendance and Certificate state
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([])
  const [selectedTaskAttendance, setSelectedTaskAttendance] = useState<TaskAttendance | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [loadingCertificates, setLoadingCertificates] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      let tasksData: Task[] = []
      let appsData: Application[] = []

      // Fetch tasks
      console.log('Fetching tasks...')
      const tasksResponse = await fetch('/api/tasks', { headers })
      if (tasksResponse.ok) {
        tasksData = await tasksResponse.json()
        console.log('Fetched tasks:', tasksData.length)
        // Sort tasks by creation date (newest first)
        tasksData.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
        setTasks(tasksData)
      } else {
        console.error('Failed to fetch tasks:', tasksResponse.status)
      }

      // Fetch applications
      console.log('Fetching applications...')
      const appsResponse = await fetch('/api/my-task-applications', { headers })
      if (appsResponse.ok) {
        const rawAppsData = await appsResponse.json()
        console.log('Fetched applications:', rawAppsData.length)
        
        // Transform the applications to match our interface
        appsData = rawAppsData.map((app: any) => ({
          id: app.id,
          taskId: app.taskId,
          volunteerId: app.volunteerId,
          volunteerName: app.volunteer?.name || 'Unknown Volunteer',
          volunteerEmail: app.volunteer?.email || '',
          volunteerSkills: app.volunteer?.skills || [],
          status: app.status,
          appliedAt: app.appliedAt,
          taskTitle: app.task?.title || 'Unknown Task',
          taskDate: app.task?.date,
          task: app.task,
          volunteer: app.volunteer
        }))
        
        setApplications(appsData)
      } else {
        console.error('Failed to fetch applications:', appsResponse.status)
      }

      // Calculate stats
      calculateStats(tasksData, appsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tasksData: Task[], appsData: Application[]) => {
    const stats = {
      totalTasks: tasksData.length,
      activeTasks: tasksData.filter(t => t.status === 'open' || t.status === 'in-progress').length,
      completedTasks: tasksData.filter(t => t.status === 'completed').length,
      totalVolunteers: new Set(tasksData.flatMap(t => t.approvedVolunteers || [])).size,
      pendingApplications: appsData.filter(a => a.status === 'pending').length
    }
    setStats(stats)
  }

  const handleCreateTask = async (taskData: any) => {
    try {
      const token = localStorage.getItem('token')
      console.log('Attempting to create task:', taskData)
      
      // Transform frontend data to backend format
      const backendTaskData = {
        title: taskData.title,
        description: taskData.description,
        location: taskData.location,
        date: taskData.date, // Send as YYYY-MM-DD string only
        duration: taskData.duration,
        hours: parseInt(taskData.duration?.split(' ')[0]) || 4, // Extract hours from duration
        maxVolunteers: taskData.maxVolunteers,
        category: taskData.category,
        urgency: taskData.urgency,
        requiredSkills: taskData.requiredSkills,
        // Map requirements to description if needed
        ...(taskData.requirements && { requirements: taskData.requirements })
      }
      
      console.log('Backend formatted data:', backendTaskData)
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendTaskData)
      })

      console.log('Create response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Create successful:', result)
        setShowCreateDialog(false)
        await loadDashboardData() // Refresh data
      } else {
        const error = await response.json()
        console.error('Error creating task:', error)
        alert(`Failed to create task: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditTask = async (taskData: any) => {
    if (!selectedTask) return
    
    try {
      const token = localStorage.getItem('token')
      console.log('Attempting to edit task:', selectedTask.id, taskData)
      
      // Transform frontend data to backend format
      const backendTaskData = {
        title: taskData.title,
        description: taskData.description,
        location: taskData.location,
        date: taskData.date, // Send as YYYY-MM-DD string only
        duration: taskData.duration,
        hours: parseInt(taskData.duration?.split(' ')[0]) || 4, // Extract hours from duration
        maxVolunteers: taskData.maxVolunteers,
        category: taskData.category,
        urgency: taskData.urgency,
        requiredSkills: taskData.requiredSkills,
        // Map requirements to description if needed
        ...(taskData.requirements && { requirements: taskData.requirements })
      }
      
      console.log('Backend formatted data:', backendTaskData)
      
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendTaskData)
      })

      console.log('Edit response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Edit successful:', result)
        setShowEditDialog(false)
        setSelectedTask(null)
        await loadDashboardData() // Refresh data
      } else {
        const error = await response.json()
        console.error('Error updating task:', error)
        alert(`Failed to update task: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setShowViewDialog(true)
  }

  const handleEditTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowEditDialog(true)
  }

  const handleDeleteTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowDeleteDialog(true)
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return
    
    try {
      const token = localStorage.getItem('token')
      console.log('Attempting to delete task:', selectedTask.id)
      
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Delete response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Delete successful:', result)
        setShowDeleteDialog(false)
        setSelectedTask(null)
        await loadDashboardData() // Refresh data
      } else {
        const error = await response.json()
        console.error('Error deleting task:', error)
        alert(`Failed to delete task: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('No authentication token found. Please log in again.')
        return
      }
      
      console.log(`Starting ${action} for application ${applicationId}`)
      
      // Try the regular API path first (with proxy)
      let apiUrl = `/api/applications/${applicationId}/${action}`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log(`Response received - URL: ${apiUrl}, Status: ${response.status}, OK: ${response.ok}`)

      if (response.status >= 200 && response.status < 300) {
        // Success response
        let result = null
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          try {
            result = await response.json()
            console.log(`${action} successful - JSON response:`, result)
          } catch (jsonError) {
            console.log(`${action} successful but JSON parse failed:`, jsonError)
          }
        } else {
          const textResult = await response.text()
          console.log(`${action} successful - Text response:`, textResult)
        }
        
        alert(`Application ${action}ed successfully!`)
        await loadDashboardData()
        
      } else if (response.status === 404 && response.url && !response.url.includes('3001')) {
        // If we get a 404 and we're not hitting the backend, try direct backend URL
        console.log('Proxy might not be working, trying direct backend URL...')
        
        const directResponse = await fetch(`http://localhost:3001/api/applications/${applicationId}/${action}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log(`Direct backend response - Status: ${directResponse.status}, OK: ${directResponse.ok}`)
        
        if (directResponse.status >= 200 && directResponse.status < 300) {
          alert(`Application ${action}ed successfully!`)
          await loadDashboardData()
        } else {
          const errorText = await directResponse.text()
          console.error(`Direct backend error:`, errorText)
          alert(`Failed to ${action} application: ${errorText}`)
        }
      } else {
        // Error response
        let errorMessage = `Failed to ${action} application (Status: ${response.status})`
        
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
            console.error(`Error ${action}ing application:`, errorData)
          } else {
            const errorText = await response.text()
            console.error(`Error ${action}ing application (non-JSON):`, errorText)
            if (errorText) {
              errorMessage = `${errorMessage}: ${errorText}`
            }
          }
        } catch (parseError) {
          console.error(`Error parsing error response:`, parseError)
        }
        
        alert(errorMessage)
      }
    } catch (networkError) {
      console.error(`Network error during ${action}:`, networkError)
      
      // If there's a network error, try the direct backend URL as fallback
      if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
        console.log('Network error detected, trying direct backend URL as fallback...')
        
        try {
          const fallbackResponse = await fetch(`http://localhost:3001/api/applications/${applicationId}/${action}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (fallbackResponse.status >= 200 && fallbackResponse.status < 300) {
            alert(`Application ${action}ed successfully!`)
            await loadDashboardData()
            return
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
        }
      }
      
      alert(`Network error while ${action}ing application: ${networkError instanceof Error ? networkError.message : 'Please check your connection and try again.'}`)
    }
  }

  // Attendance and Certificate Functions
  const loadTodaysTasks = async () => {
    try {
      setLoadingAttendance(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTodaysTasks(data)
      } else {
        console.error('Failed to load today\'s tasks')
      }
    } catch (error) {
      console.error('Error loading today\'s tasks:', error)
    } finally {
      setLoadingAttendance(false)
    }
  }

  const loadTaskAttendance = async (taskId: string) => {
    try {
      setLoadingAttendance(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/attendance/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedTaskAttendance(data)
      } else {
        console.error('Failed to load task attendance')
      }
    } catch (error) {
      console.error('Error loading task attendance:', error)
    } finally {
      setLoadingAttendance(false)
    }
  }

  const markAttendance = async (taskId: string, volunteerId: string, status: 'present' | 'absent', hoursCompleted: number = 0) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId,
          volunteerId,
          status,
          hoursCompleted
        })
      })

      if (response.ok) {
        // Refresh attendance data for this task
        await loadTaskAttendance(taskId)
        return true
      } else {
        const error = await response.json()
        alert(`Failed to mark attendance: ${error.error}`)
        return false
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      alert('Network error while marking attendance')
      return false
    }
  }

  const generateCertificate = async (taskId: string, volunteerId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId,
          volunteerId
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('Certificate generated successfully!')
        await loadCertificates() // Refresh certificates
        return true
      } else {
        const error = await response.json()
        alert(`Failed to generate certificate: ${error.error}`)
        return false
      }
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Network error while generating certificate')
      return false
    }
  }

  const loadCertificates = async () => {
    try {
      setLoadingCertificates(true)
      const token = localStorage.getItem('token')
      
      // Get certificates for all tasks
      const allCertificates: Certificate[] = []
      
      for (const task of tasks) {
        const response = await fetch(`/api/certificates/task/${task.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const taskCertificates = await response.json()
          allCertificates.push(...taskCertificates)
        }
      }

      setCertificates(allCertificates)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoadingCertificates(false)
    }
  }

  // Load attendance and certificate data when tabs are accessed
  useEffect(() => {
    if (activeTab === 'attendance') {
      loadTodaysTasks()
    } else if (activeTab === 'certificates') {
      loadCertificates()
    }
  }, [activeTab, tasks])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading NGO Dashboard...</p>
          </div>
        </div>
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
                <Building2 className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  NGO Connect
                </h1>
                <p className="text-sm text-slate-600 font-medium">Welcome back, {user?.name} 👋</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Tasks Overview Badge */}
              <Button
                variant="ghost"
                className="hidden md:flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                onClick={() => setActiveTab('overview')}
              >
                <Activity className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Active Tasks</p>
                  <p className="text-sm font-bold text-emerald-800">{stats.activeTasks} of {stats.totalTasks}</p>
                </div>
              </Button>

              {/* Volunteers Badge */}
              <div className="bg-gradient-to-r from-teal-100 to-cyan-100 px-4 py-2 rounded-xl border border-teal-200">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-800">{stats.totalVolunteers} volunteers</span>
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
                {stats.pendingApplications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.pendingApplications}
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
                variant="ghost" 
                size="sm" 
                className="hover:bg-red-50 text-red-600 hover:text-red-700"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Create Task Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Dashboard Overview</h2>
            <p className="text-slate-600">Manage your volunteer opportunities and applications</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Volunteer Task</DialogTitle>
            </DialogHeader>
            <CreateTaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <CreateTaskForm
                onSubmit={handleEditTask}
                onCancel={() => {
                  setShowEditDialog(false)
                  setSelectedTask(null)
                }}
                initialData={{
                  title: selectedTask.title,
                  description: selectedTask.description,
                  location: selectedTask.location,
                  date: new Date(selectedTask.date).toISOString(),
                  time: new Date(selectedTask.date).toISOString().substring(11, 16),
                  duration: '3 hours', // Default fallback
                  maxVolunteers: selectedTask.maxVolunteers,
                  category: selectedTask.category,
                  urgency: selectedTask.urgency,
                  requiredSkills: selectedTask.requiredSkills || [],
                  requirements: ''
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* View Task Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-teal-600" />
                Task Details
              </DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{selectedTask.title}</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={getStatusColor(selectedTask.status)}>
                      {selectedTask.status}
                    </Badge>
                    <Badge className={getUrgencyColor(selectedTask.urgency)}>
                      {selectedTask.urgency} priority
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Description</h4>
                  <p className="text-slate-600">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-700 mb-1">Location</h4>
                    <p className="text-slate-600 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedTask.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 mb-1">Date</h4>
                    <p className="text-slate-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedTask.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-1">Volunteers</h4>
                  <p className="text-slate-600 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {(selectedTask.approvedVolunteers || []).length}/{selectedTask.maxVolunteers} volunteers
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTask.requiredSkills || []).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {(!selectedTask.requiredSkills || selectedTask.requiredSkills.length === 0) && (
                      <span className="text-slate-500 text-sm">No skills specified</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Task Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Task
              </DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <h4 className="font-medium text-slate-900">{selectedTask.title}</h4>
                  <p className="text-sm text-slate-600">{selectedTask.location}</p>
                  <p className="text-sm text-slate-600">{new Date(selectedTask.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setSelectedTask(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteTask}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-100">Active Tasks</p>
                <p className="text-2xl font-bold text-white">{stats.activeTasks}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-100">Total Volunteers</p>
                <p className="text-2xl font-bold text-white">{stats.totalVolunteers}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">Pending Apps</p>
                <p className="text-2xl font-bold text-white">{stats.pendingApplications}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg border border-emerald-200/50">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="tasks"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
          >
            My Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="applications"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
          >
            Applications
          </TabsTrigger>
          <TabsTrigger 
            value="attendance"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger 
            value="certificates"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
          >
            Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <FileText className="text-white h-5 w-5" />
                      </div>
                      <div className="flex-1 ml-4">
                        <h4 className="font-medium text-slate-900">{task.title}</h4>
                        <p className="text-sm text-slate-600">{task.location} • {new Date(task.date).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No tasks created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Applications */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Users className="h-5 w-5 text-blue-600" />
                  Pending Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applications.filter(app => app.status === 'pending').slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                      <div>
                        <h4 className="font-medium text-slate-900">{app.volunteerName}</h4>
                        <p className="text-sm text-slate-600">{app.taskTitle}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApplicationAction(app.id, 'approve')}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplicationAction(app.id, 'reject')}
                          className="border-slate-300 hover:bg-slate-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {applications.filter(app => app.status === 'pending').length === 0 && (
                    <p className="text-slate-500 text-center py-4">No pending applications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge className={getUrgencyColor(task.urgency)}>
                          {task.urgency} priority
                        </Badge>
                      </div>
                      
                      <p className="text-slate-600 mb-4">{task.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg">
                          <MapPin className="h-4 w-4 text-teal-600" />
                          <span className="text-sm text-slate-700 font-medium">{task.location}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-slate-700 font-medium">{new Date(task.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-slate-700 font-medium">
                            {(task.approvedVolunteers || []).length}/{task.maxVolunteers || 0} volunteers
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-slate-700">Required Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {(task.requiredSkills || []).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700">
                              {skill}
                            </Badge>
                          ))}
                          {(!task.requiredSkills || task.requiredSkills.length === 0) && (
                            <span className="text-xs text-slate-500">No skills specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewTask(task)}
                        className="hover:bg-teal-50 hover:border-teal-300 border-teal-200"
                      >
                        <Eye className="h-4 w-4 text-teal-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTaskClick(task)}
                        className="hover:bg-emerald-50 hover:border-emerald-300 border-emerald-200"
                      >
                        <Edit className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteTaskClick(task)}
                        className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tasks.length === 0 && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
                  <p className="text-slate-600 mb-4">Create your first volunteer opportunity to get started</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-slate-900">
                          {app.volunteer?.name || app.volunteerName || 'Unknown Volunteer'}
                        </h3>
                        <Badge className={
                          app.status === 'approved' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {app.status}
                        </Badge>
                      </div>
                      
                      <p className="text-slate-600 mb-2">
                        <span className="font-medium">Applied for:</span> {app.task?.title || app.taskTitle}
                      </p>
                      
                      {app.task?.date && (
                        <p className="text-slate-600 mb-2">
                          <span className="font-medium">Task Date:</span> {new Date(app.task.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                      
                      <p className="text-sm text-slate-500 mb-3">
                        <span className="font-medium">Applied on:</span> {new Date(app.appliedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {app.volunteerSkills?.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          )) || <span className="text-xs text-slate-500">No skills listed</span>}
                        </div>
                      </div>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApplicationAction(app.id, 'approve')}
                          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplicationAction(app.id, 'reject')}
                          className="border-slate-300 hover:bg-slate-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {applications.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No applications yet</h3>
                  <p className="text-slate-600">Applications will appear here when volunteers apply to your tasks</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Tasks for Attendance */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">Loading tasks...</p>
                  </div>
                ) : todaysTasks.length > 0 ? (
                  <div className="space-y-3">
                    {todaysTasks.map((task) => (
                      <div key={task.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900">{task.title}</h4>
                            <p className="text-sm text-slate-600">{task.location} • {new Date(task.date).toLocaleDateString()}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => loadTaskAttendance(task.id)}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                          >
                            Mark Attendance
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No tasks scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Marking Panel */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Users className="h-5 w-5 text-emerald-600" />
                  {selectedTaskAttendance ? `Attendance - ${selectedTaskAttendance.taskTitle}` : 'Select a Task'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTaskAttendance ? (
                  <div className="space-y-4">
                    {selectedTaskAttendance.volunteers.map((volunteer) => (
                      <div key={volunteer.volunteerId} className="p-4 bg-white rounded-lg border border-emerald-100 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-slate-900">{volunteer.volunteerName}</h5>
                            <p className="text-sm text-slate-600">{volunteer.volunteerEmail}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={
                                volunteer.attendanceStatus === 'present' ? 'bg-green-100 text-green-800' :
                                volunteer.attendanceStatus === 'absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {volunteer.attendanceStatus}
                            </Badge>
                            <span className="text-xs font-semibold ml-2">
                              {(() => {
                                // Show tracking status after activity date
                                const task = tasks.find(t => t.id === selectedTaskAttendance.taskId);
                                const taskDate = task ? new Date(task.date) : null;
                                const now = new Date();
                                if (taskDate && now > taskDate) {
                                  if (volunteer.attendanceStatus === 'present') return 'Completed';
                                  if (volunteer.attendanceStatus === 'absent') return 'Not Started';
                                  return 'In Progress';
                                }
                                return 'In Progress';
                              })()}
                            </span>
                            {volunteer.attendanceStatus === 'pending' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => markAttendance(selectedTaskAttendance.taskId, volunteer.volunteerId, 'present', 4)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs"
                                >
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => markAttendance(selectedTaskAttendance.taskId, volunteer.volunteerId, 'absent')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs"
                                >
                                  Absent
                                </Button>
                              </div>
                            )}
                            {/* Only allow certificate if present and after activity date */}
                            {(() => {
                              const task = tasks.find(t => t.id === selectedTaskAttendance.taskId);
                              const taskDate = task ? new Date(task.date) : null;
                              const now = new Date();
                              if (
                                volunteer.attendanceStatus === 'present' &&
                                taskDate && now > taskDate
                              ) {
                                return (
                                  <Button
                                    size="sm"
                                    onClick={() => generateCertificate(selectedTaskAttendance.taskId, volunteer.volunteerId)}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-2 py-1 text-xs"
                                  >
                                    Generate Certificate
                                  </Button>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                        {volunteer.hoursCompleted > 0 && (
                          <p className="text-sm text-emerald-600 mt-2">Hours completed: {volunteer.hoursCompleted}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Select a task to mark attendance</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="h-5 w-5 text-yellow-600" />
                Generated Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCertificates ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">Loading certificates...</p>
                </div>
              ) : certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((certificate) => (
                    <Card key={certificate.id} className="border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                            <FileText className="text-white h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-900">{certificate.volunteerName}</h5>
                            <p className="text-sm text-slate-600">{certificate.taskTitle}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Certificate #:</span>
                            <span className="font-mono text-xs">{certificate.certificateNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Hours:</span>
                            <span className="font-medium">{certificate.hoursCompleted}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Generated:</span>
                            <span>{new Date(certificate.generatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Status:</span>
                            <Badge className={certificate.status === 'downloaded' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {certificate.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No certificates generated yet</h3>
                  <p className="text-slate-600">Certificates will appear here after volunteers complete tasks and you mark their attendance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600" />
              Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {stats.pendingApplications > 0 ? (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800 font-medium">
                  You have {stats.pendingApplications} pending application{stats.pendingApplications !== 1 ? 's' : ''} to review
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No new notifications</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-600" />
              Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Settings panel coming soon</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  )
}
