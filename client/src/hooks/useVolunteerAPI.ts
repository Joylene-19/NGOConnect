import { useState, useCallback } from 'react'

export interface Task {
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
  appliedVolunteers?: string[]
}

export interface Application {
  id: string
  taskId: string
  taskTitle: string
  volunteerName: string
  ngoName: string
  status: "pending" | "approved" | "rejected"
  appliedAt: string
  message?: string
}

export interface Certificate {
  id: string
  taskId: string
  taskTitle: string
  volunteerName: string
  ngoName: string
  issuedAt: string
  hours: number
  downloadUrl?: string
}

export interface TaskStats {
  totalTasks: number
  appliedTasks: number
  completedTasks: number
  pendingApplications: number
  totalHours: number
  certificates: number
}

export const useVolunteerAPI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const handleRequest = async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Task-related functions
  const getTasks = useCallback(async (): Promise<Task[]> => {
    return handleRequest<Task[]>('/api/tasks')
  }, [])

  const getTaskById = useCallback(async (id: string): Promise<Task> => {
    return handleRequest<Task>(`/api/tasks/${id}`)
  }, [])

  const createTask = useCallback(async (taskData: Partial<Task>): Promise<Task> => {
    return handleRequest<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    })
  }, [])

  const updateTask = useCallback(async (id: string, taskData: Partial<Task>): Promise<Task> => {
    return handleRequest<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    })
  }, [])

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    return handleRequest<void>(`/api/tasks/${id}`, {
      method: 'DELETE'
    })
  }, [])

  // Application-related functions
  const applyToTask = useCallback(async (taskId: string, message?: string): Promise<Application> => {
    return handleRequest<Application>('/api/task-applications', {
      method: 'POST',
      body: JSON.stringify({ taskId, message })
    })
  }, [])

  const getMyApplications = useCallback(async (): Promise<Application[]> => {
    return handleRequest<Application[]>('/api/my-task-applications')
  }, [])

  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    status: 'approved' | 'rejected',
    message?: string
  ): Promise<Application> => {
    return handleRequest<Application>(`/api/task-applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, message })
    })
  }, [])

  // Certificate-related functions
  const getMyCertificates = useCallback(async (): Promise<Certificate[]> => {
    return handleRequest<Certificate[]>('/api/my-certificates')
  }, [])

  const downloadCertificate = useCallback(async (certificateId: string): Promise<Blob> => {
    const response = await fetch(`/api/certificates/${certificateId}/download`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to download certificate')
    }

    return response.blob()
  }, [])

  // Stats and dashboard functions
  const getTaskStats = useCallback(async (): Promise<TaskStats> => {
    return handleRequest<TaskStats>('/api/tasks/status-summary')
  }, [])

  const searchTasks = useCallback(async (query: string, filters?: {
    category?: string
    location?: string
    urgency?: string
    skills?: string[]
  }): Promise<Task[]> => {
    const params = new URLSearchParams()
    if (query) params.append('q', query)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.location) params.append('location', filters.location)
    if (filters?.urgency) params.append('urgency', filters.urgency)
    if (filters?.skills?.length) {
      filters.skills.forEach(skill => params.append('skills', skill))
    }

    return handleRequest<Task[]>(`/api/tasks/search?${params.toString()}`)
  }, [])

  // Feedback and rating functions
  const submitFeedback = useCallback(async (taskId: string, rating: number, comment: string): Promise<void> => {
    return handleRequest<void>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({ taskId, rating, comment })
    })
  }, [])

  return {
    loading,
    error,
    clearError: () => setError(null),
    
    // Task operations
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    searchTasks,
    
    // Application operations
    applyToTask,
    getMyApplications,
    updateApplicationStatus,
    
    // Certificate operations
    getMyCertificates,
    downloadCertificate,
    
    // Stats and analytics
    getTaskStats,
    
    // Feedback
    submitFeedback
  }
}

export default useVolunteerAPI
