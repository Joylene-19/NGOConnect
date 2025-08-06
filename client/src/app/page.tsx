"use client"

import { useState, useEffect } from "react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Navigation from "@/components/navigation"
import {
  Heart,
  Users,
  Building2,
  Search,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Handshake,
  Target,
} from "lucide-react"

// Mock data
const mockStats = {
  totalVolunteers: 12547,
  activeNGOs: 289,
  completedTasks: 3420,
  totalHours: 154200,
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
    image: "/beach-cleanup.svg",
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
    image: "/food-bank.svg",
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
    image: "/tree-planting.svg",
  },
]

const mockTestimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Volunteer",
    content:
      "NGOConnect helped me find meaningful volunteer opportunities that align with my passion for environmental conservation.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: 2,
    name: "Green Future Foundation",
    role: "NGO",
    content:
      "The platform made it incredibly easy to connect with dedicated volunteers and manage our community projects effectively.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
  },
  {
    id: 3,
    name: "Mike Chen",
    role: "Volunteer",
    content:
      "I've completed over 50 hours of volunteer work through NGOConnect. The experience has been life-changing!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
  },
]

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOpportunities, setFilteredOpportunities] = useState(mockFeaturedOpportunities)
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmittingContact, setIsSubmittingContact] = useState(false)

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % mockTestimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Filter opportunities based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOpportunities(mockFeaturedOpportunities)
    } else {
      const filtered = mockFeaturedOpportunities.filter(opportunity =>
        opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredOpportunities(filtered)
    }
  }, [searchQuery])

  const handleSearch = () => {
    // Scroll to opportunities section
    const opportunitiesSection = document.getElementById('opportunities')
    if (opportunitiesSection) {
      opportunitiesSection.scrollIntoView({ behavior: 'smooth' })
    }
    console.log('Searching for:', searchQuery, 'Found:', filteredOpportunities.length, 'opportunities')
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingContact(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      })

      if (response.ok) {
        alert('Thank you for your message! We\'ll get back to you soon.')
        setContactForm({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: ""
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      alert('Sorry, there was an error sending your message. Please try again or email us directly at support@ngoconnect.org')
    } finally {
      setIsSubmittingContact(false)
    }
  }

  const handleContactChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 py-20">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-teal-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-emerald-200 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cyan-200 rounded-full opacity-20 animate-pulse-slow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-teal-100 text-teal-800 border-teal-200 px-4 py-2">
                  🌟 Join 12,000+ Active Volunteers
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Connecting
                  <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    {" "}
                    Hearts
                  </span>
                  ,
                  <br />
                  Creating
                  <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    {" "}
                    Impact
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Join thousands of volunteers and NGOs making a real difference in communities worldwide. Find
                  opportunities, track your impact, and earn recognition for your contributions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 text-lg"
                  asChild
                >
                  <Link href="/signup">Start Volunteering</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-teal-200 text-teal-700 hover:bg-teal-50 px-8 py-4 text-lg bg-transparent"
                  asChild
                >
                  <Link href="/signup">Register Your NGO</Link>
                </Button>
              </div>

              {/* Quick Search */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Find Opportunities Near You</h3>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Search by location, cause, or organization..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    className="h-12 px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Hero Image/Animation */}
            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white">
                      <Users className="h-8 w-8 mb-2" />
                      <p className="text-2xl font-bold">{mockStats.totalVolunteers.toLocaleString()}</p>
                      <p className="text-sm opacity-90">Active Volunteers</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl p-6 text-white">
                      <Building2 className="h-8 w-8 mb-2" />
                      <p className="text-2xl font-bold">{mockStats.activeNGOs}</p>
                      <p className="text-sm opacity-90">Verified NGOs</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
                      <CheckCircle className="h-8 w-8 mb-2" />
                      <p className="text-2xl font-bold">{mockStats.completedTasks.toLocaleString()}</p>
                      <p className="text-sm opacity-90">Tasks Completed</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                      <Clock className="h-8 w-8 mb-2" />
                      <p className="text-2xl font-bold">{(mockStats.totalHours / 1000).toFixed(0)}K+</p>
                      <p className="text-sm opacity-90">Hours Contributed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose NGOConnect?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We make it easy for volunteers and NGOs to connect, collaborate, and create lasting impact in communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-teal-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Global Reach</h3>
                <p className="text-slate-600">
                  Connect with opportunities worldwide and make an impact in communities across the globe.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Handshake className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Verified Partners</h3>
                <p className="text-slate-600">
                  All NGOs are thoroughly verified to ensure your volunteer efforts go to legitimate causes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Impact Tracking</h3>
                <p className="text-slate-600">
                  Track your volunteer hours, earn certificates, and see the real impact of your contributions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section id="opportunities" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Opportunities</h2>
            <p className="text-xl text-slate-600">
              Discover meaningful volunteer opportunities that match your interests and skills.
            </p>
            {searchQuery && (
              <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-teal-700">
                  {filteredOpportunities.length > 0 
                    ? `Found ${filteredOpportunities.length} opportunities matching "${searchQuery}"`
                    : `No opportunities found matching "${searchQuery}". Try a different search term.`
                  }
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-xl transition-all duration-300 group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={opportunity.image || "/placeholder.svg"}
                    alt={opportunity.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getUrgencyColor(opportunity.urgency)}>{opportunity.urgency} priority</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">{opportunity.title}</h3>
                      <p className="text-teal-600 font-medium">{opportunity.organization}</p>
                    </div>

                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(opportunity.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {opportunity.volunteers}/{opportunity.maxVolunteers} volunteers
                        </span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700" asChild>
                      <Link href="/login">
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOpportunities.length === 0 && searchQuery && (
            <div className="text-center mt-12">
              <div className="bg-slate-100 rounded-lg p-8">
                <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No opportunities found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your search terms or browse all opportunities.</p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="mr-4"
                >
                  Clear Search
                </Button>
                <Button asChild>
                  <Link href="/opportunities">Browse All</Link>
                </Button>
              </div>
            </div>
          )}

          {filteredOpportunities.length > 0 && (
            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50 bg-transparent"
                asChild
              >
                <Link href="/signup">
                  View All Opportunities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What Our Community Says</h2>
            <p className="text-xl text-slate-600">
              Hear from volunteers and NGOs who are making a difference through NGOConnect.
            </p>
          </div>

          <div className="relative">
            <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(mockTestimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-slate-700 mb-6 italic">
                  "{mockTestimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={mockTestimonials[currentTestimonial].avatar || "/placeholder.svg"}
                    alt={mockTestimonials[currentTestimonial].name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{mockTestimonials[currentTestimonial].name}</p>
                    <p className="text-sm text-teal-600">{mockTestimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {mockTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-teal-600" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">About NGOConnect</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We're building a bridge between passionate volunteers and impactful NGOs to create meaningful change in communities worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                NGOConnect was founded with a simple yet powerful vision: to make volunteering accessible, 
                meaningful, and impactful for everyone. We believe that when passionate volunteers connect 
                with purpose-driven organizations, extraordinary things happen.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Verified Organizations</h4>
                    <p className="text-slate-600">All NGOs are thoroughly vetted to ensure legitimate and impactful work.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Skill-Based Matching</h4>
                    <p className="text-slate-600">Find opportunities that match your skills and interests perfectly.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Impact Tracking</h4>
                    <p className="text-slate-600">See the real difference your contributions make in communities.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <h4 className="text-3xl font-bold text-teal-700">{mockStats.totalVolunteers.toLocaleString()}</h4>
                    <p className="text-teal-600 font-medium">Active Volunteers</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-emerald-700">{mockStats.activeNGOs}</h4>
                    <p className="text-emerald-600 font-medium">Partner NGOs</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-cyan-700">{mockStats.completedTasks.toLocaleString()}</h4>
                    <p className="text-cyan-600 font-medium">Projects Completed</p>
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold text-teal-700">{(mockStats.totalHours / 1000).toFixed(0)}K+</h4>
                    <p className="text-teal-600 font-medium">Hours Volunteered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Center Section */}
      <section id="help" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Help Center</h2>
            <p className="text-xl text-slate-600">
              Find answers to common questions and get the support you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-teal-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">For Volunteers</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• How to find opportunities</li>
                  <li>• Creating your profile</li>
                  <li>• Tracking volunteer hours</li>
                  <li>• Earning certificates</li>
                </ul>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/volunteer-guide">Volunteer Guide</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">For NGOs</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Posting opportunities</li>
                  <li>• Managing volunteers</li>
                  <li>• Verification process</li>
                  <li>• Best practices</li>
                </ul>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/ngo-guide">NGO Guide</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">General Support</h3>
                <ul className="space-y-2 text-slate-600">
                  <li>• Account management</li>
                  <li>• Technical issues</li>
                  <li>• Platform features</li>
                  <li>• Contact support</li>
                </ul>
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href="/general-support">Get Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-slate-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Global Reach</h3>
                    <p className="text-slate-600">Connecting volunteers and NGOs worldwide</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Support Team</h3>
                    <p className="text-slate-600">Available 24/7 to help you make an impact</p>
                    <p className="text-emerald-600 font-medium">support@ngoconnect.org</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Handshake className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Partner with Us</h3>
                    <p className="text-slate-600">Join as an NGO partner</p>
                    <p className="text-cyan-600 font-medium">partnerships@ngoconnect.org</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <Input 
                        placeholder="Your first name" 
                        className="border-slate-200"
                        value={contactForm.firstName}
                        onChange={(e) => handleContactChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <Input 
                        placeholder="Your last name" 
                        className="border-slate-200"
                        value={contactForm.lastName}
                        onChange={(e) => handleContactChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <Input 
                      type="email" 
                      placeholder="your.email@example.com" 
                      className="border-slate-200"
                      value={contactForm.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <Input 
                      placeholder="What's this about?" 
                      className="border-slate-200"
                      value={contactForm.subject}
                      onChange={(e) => handleContactChange('subject', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea 
                      className="w-full min-h-[100px] p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Tell us how we can help..."
                      value={contactForm.message}
                      onChange={(e) => handleContactChange('message', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                    disabled={isSubmittingContact}
                  >
                    {isSubmittingContact ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-teal-100 mb-8">
            Join our community today and start creating positive impact in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-teal-600 hover:bg-slate-100 px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/signup">Join as Volunteer</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 text-lg font-semibold bg-transparent"
              asChild
            >
              <Link href="/signup">Register NGO</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Heart className="text-white h-4 w-4" />
                </div>
                <h3 className="text-xl font-bold">NGOConnect</h3>
              </div>
              <p className="text-slate-400">
                Connecting hearts and creating impact through meaningful volunteer opportunities worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Volunteers</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/opportunities" className="hover:text-white transition-colors">
                    Find Opportunities
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer-dashboard" className="hover:text-white transition-colors">
                    Volunteer Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/certificates" className="hover:text-white transition-colors">
                    Certificates
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For NGOs</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/ngo-dashboard" className="hover:text-white transition-colors">
                    NGO Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/post-opportunity" className="hover:text-white transition-colors">
                    Post Opportunities
                  </Link>
                </li>
                <li>
                  <Link href="/verification" className="hover:text-white transition-colors">
                    Get Verified
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button 
                    onClick={() => {
                      const helpSection = document.getElementById('help');
                      if (helpSection) {
                        helpSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        // Navigate to help page if section doesn't exist
                        window.location.href = '/help';
                      }
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const contactSection = document.getElementById('contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="hover:text-white transition-colors text-left"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 NGOConnect. All rights reserved. Made with ❤️ for a better world.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
