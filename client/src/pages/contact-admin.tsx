import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Clock, CheckCircle, MessageCircle, User } from "lucide-react"

interface ContactMessage {
  id: string
  fullName: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'resolved'
  createdAt: string
}

interface ContactStats {
  total: number
  new: number
  read: number
  replied: number
  resolved: number
}

export default function ContactMessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContactData()
  }, [])

  const fetchContactData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats (public endpoint)
      const statsResponse = await fetch('/api/contact-stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // For now, we'll just show stats since we need admin auth for messages
      // In a real app, you'd fetch messages with admin token
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch contact data')
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'read':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'replied':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'resolved':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading contact messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Contact Messages</h1>
          <p className="text-slate-600">Manage and respond to contact form submissions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Messages</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">New</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Read</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Replied</p>
                    <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-gray-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Resolved</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.resolved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions for checking MongoDB */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📊 How to Check Contact Messages in MongoDB Atlas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Option 1: MongoDB Atlas Web Interface</h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Go to <a href="https://cloud.mongodb.com" target="_blank" className="underline">MongoDB Atlas</a></li>
                  <li>Sign in to your account</li>
                  <li>Select your cluster (ngoconnect database)</li>
                  <li>Click "Browse Collections"</li>
                  <li>Look for the <strong>"contacts"</strong> collection</li>
                  <li>You'll see all contact form submissions there</li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Option 2: Command Line Check</h3>
                <p className="text-green-800 mb-2">Run this command in your terminal:</p>
                <code className="bg-green-100 p-2 rounded text-green-900 block">
                  node check-contact-db.js
                </code>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Option 3: API Endpoint</h3>
                <p className="text-purple-800 mb-2">Check contact statistics:</p>
                <code className="bg-purple-100 p-2 rounded text-purple-900 block">
                  GET http://localhost:3001/api/contact-stats
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats && stats.total > 0 && (
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Great! You have {stats.total} contact message{stats.total !== 1 ? 's' : ''} in your database.
            </p>
            <p className="text-sm text-slate-500">
              To view full message details, check MongoDB Atlas or use the admin dashboard with proper authentication.
            </p>
          </div>
        )}

        {stats && stats.total === 0 && (
          <div className="text-center">
            <Mail className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Contact Messages Yet</h3>
            <p className="text-slate-600 mb-4">
              Once people start using the contact form on your website, their messages will appear here.
            </p>
            <Button onClick={() => window.open('/', '_blank')}>
              Test Contact Form
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
