"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  TrendingUp,
  Users,
  Building2,
  Award,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  CheckCircle,
} from "lucide-react"

// Mock data for the general dashboard
const mockStats = {
  totalVolunteers: 1158,
  activeNGOs: 89,
  completedTasks: 342,
  totalHours: 15420,
}

const mockFeaturedOpportunities = [
  {
    id: 1,
    title: "Beach Cleanup Drive",
    organization: "Ocean Guardians",
    location: "Santa Monica Beach, CA",
    date: "2024-01-20",
    volunteers: 12,
    maxVolunteers: 20,
    category: "Environment",
    urgency: "high",
  },
  {
    id: 2,
    title: "Food Bank Sorting",
    organization: "Community Food Bank",
    location: "Downtown Community Center",
    date: "2024-01-18",
    volunteers: 8,
    maxVolunteers: 15,
    category: "Social Services",
    urgency: "medium",
  },
  {
    id: 3,
    title: "Tree Planting Initiative",
    organization: "Green Future Foundation",
    location: "Central Park Area",
    date: "2024-01-25",
    volunteers: 15,
    maxVolunteers: 25,
    category: "Environment",
    urgency: "low",
  },
]

const mockTopVolunteers = [
  {
    id: 1,
    name: "Sarah Johnson",
    hours: 45,
    tasks: 8,
    rating: 4.9,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Mike Chen",
    hours: 38,
    tasks: 6,
    rating: 4.8,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Emily Davis",
    hours: 32,
    tasks: 5,
    rating: 4.7,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const mockTopNGOs = [
  {
    id: 1,
    name: "Green Future Foundation",
    tasksPosted: 15,
    volunteersHelped: 120,
    category: "Environment",
    verified: true,
  },
  {
    id: 2,
    name: "Ocean Guardians",
    tasksPosted: 12,
    volunteersHelped: 95,
    category: "Environment",
    verified: true,
  },
  {
    id: 3,
    name: "Community Food Bank",
    tasksPosted: 10,
    volunteersHelped: 80,
    category: "Social Services",
    verified: true,
  },
]

export default function Dashboard() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Heart className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">NGOConnect</h1>
                <p className="text-sm text-slate-600">Platform Overview</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Connecting Hearts, Creating Impact</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join thousands of volunteers and NGOs making a difference in communities worldwide. Find opportunities,
            track your impact, and earn recognition for your contributions.
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600">Active Volunteers</p>
                  <p className="text-3xl font-bold text-teal-900">{mockStats.totalVolunteers}</p>
                </div>
                <Users className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Verified NGOs</p>
                  <p className="text-3xl font-bold text-emerald-900">{mockStats.activeNGOs}</p>
                </div>
                <Building2 className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-600">Completed Tasks</p>
                  <p className="text-3xl font-bold text-cyan-900">{mockStats.completedTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Hours</p>
                  <p className="text-3xl font-bold text-purple-900">{mockStats.totalHours.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Opportunities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900">Featured Opportunities</CardTitle>
                  <Button variant="outline" className="text-teal-600 border-teal-200 hover:bg-teal-50 bg-transparent">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFeaturedOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-slate-900">{opportunity.title}</h4>
                            <Badge className={getUrgencyColor(opportunity.urgency)}>{opportunity.urgency}</Badge>
                          </div>
                          <p className="text-sm text-teal-600 font-medium mb-2">{opportunity.organization}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {opportunity.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(opportunity.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {opportunity.volunteers}/{opportunity.maxVolunteers}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Volunteers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-amber-500" />
                  Top Volunteers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopVolunteers.map((volunteer, index) => (
                    <div key={volunteer.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-amber-100 text-amber-800"
                              : index === 1
                                ? "bg-slate-100 text-slate-800"
                                : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={volunteer.avatar || "/placeholder.svg"} alt={volunteer.name} />
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                          {volunteer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{volunteer.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span>{volunteer.hours}h</span>
                          <span>•</span>
                          <span>{volunteer.tasks} tasks</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-amber-400 fill-current" />
                            <span className="ml-1">{volunteer.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top NGOs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
                  Active NGOs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopNGOs.map((ngo) => (
                    <div key={ngo.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-slate-900">{ngo.name}</h4>
                          {ngo.verified && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {ngo.category}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{ngo.tasksPosted} tasks posted</span>
                        <span>{ngo.volunteersHelped} volunteers helped</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
