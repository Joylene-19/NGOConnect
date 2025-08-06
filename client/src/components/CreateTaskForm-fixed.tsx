import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  X,
  Lightbulb,
  Zap
} from "lucide-react"

interface TaskFormData {
  title: string
  description: string
  location: string
  date: string
  time: string
  duration: string
  maxVolunteers: number
  category: string
  urgency: "low" | "medium" | "high"
  requiredSkills: string[]
  requirements: string
}

interface CreateTaskFormProps {
  onSubmit: (taskData: TaskFormData) => Promise<void>
  loading?: boolean
  onCancel?: () => void
}

const PREDEFINED_SKILLS = [
  "Communication", "Leadership", "Teaching", "Healthcare", "Technology", 
  "Environmental", "Physical Work", "Teamwork", "Photography", "Writing",
  "Social Media", "Event Planning", "Research", "Data Entry", "Customer Service",
  "Translation", "Art & Design", "Music", "Cooking", "Gardening",
  "Animal Care", "Child Care", "Senior Care", "First Aid", "Project Management"
]

const CATEGORIES = [
  "Community Service", "Environmental", "Education", "Healthcare", 
  "Animal Welfare", "Youth Development", "Senior Care", "Emergency Response",
  "Food Security", "Housing", "Arts & Culture", "Technology", "Other"
]

export default function CreateTaskForm({ onSubmit, loading = false, onCancel }: CreateTaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    duration: "",
    maxVolunteers: 1,
    category: "",
    urgency: "medium",
    requiredSkills: [],
    requirements: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSkillsDialog, setShowSkillsDialog] = useState(false)
  const [customSkill, setCustomSkill] = useState("")

  // Set default date to today's date and minimum date validation
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, date: today }))
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.duration.trim()) newErrors.duration = "Duration is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (formData.maxVolunteers < 1) newErrors.maxVolunteers = "At least 1 volunteer is required"
    
    // Date validation - ensure it's not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to compare only dates
      
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past"
      }
    }

    if (formData.requiredSkills.length === 0) {
      newErrors.requiredSkills = "At least one skill is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await onSubmit(formData)
      
      // Reset form on successful submission
      setFormData({
        title: "",
        description: "",
        location: "",
        date: new Date().toISOString().split('T')[0], // Reset to today
        time: "",
        duration: "",
        maxVolunteers: 1,
        category: "",
        urgency: "medium",
        requiredSkills: [],
        requirements: ""
      })
      setErrors({})
    } catch (error) {
      console.error("Error submitting task:", error)
    }
  }

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }))
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.requiredSkills.includes(customSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, customSkill.trim()]
      }))
      setCustomSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }))
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high": return <Zap className="h-4 w-4" />
      case "medium": return <Lightbulb className="h-4 w-4" />
      case "low": return <Clock className="h-4 w-4" />
      default: return null
    }
  }

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
          <Plus className="h-6 w-6 text-blue-600" />
          Create New Volunteer Task
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Create an engaging volunteer opportunity with proper date validation and required skills
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                Task Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Beach Cleanup at Santa Monica"
                className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="lg:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide a detailed description of the volunteer task, what volunteers will do, and what impact they'll make..."
                rows={4}
                className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., 123 Main St, Los Angeles, CA"
                className={`mt-1 ${errors.location ? 'border-red-500' : ''}`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className={`mt-1 ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date * (Today or Future)
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                min={today} // Prevent past dates
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`mt-1 ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Only today or future dates allowed
              </p>
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className={`mt-1 ${errors.time ? 'border-red-500' : ''}`}
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration" className="text-sm font-medium text-slate-700">
                Duration *
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 3 hours"
                className={`mt-1 ${errors.duration ? 'border-red-500' : ''}`}
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
              )}
            </div>
          </div>

          {/* Volunteers and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxVolunteers" className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Max Volunteers *
              </Label>
              <Input
                id="maxVolunteers"
                type="number"
                min="1"
                value={formData.maxVolunteers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxVolunteers: parseInt(e.target.value) || 1 }))}
                className={`mt-1 ${errors.maxVolunteers ? 'border-red-500' : ''}`}
              />
              {errors.maxVolunteers && (
                <p className="text-red-500 text-sm mt-1">{errors.maxVolunteers}</p>
              )}
            </div>

            <div>
              <Label htmlFor="urgency" className="text-sm font-medium text-slate-700">
                Priority Level *
              </Label>
              <Select value={formData.urgency} onValueChange={(value: "low" | "medium" | "high") => setFormData(prev => ({ ...prev, urgency: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>Low Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span>Medium Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-red-600" />
                      <span>High Priority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                <Badge className={`${getUrgencyColor(formData.urgency)} inline-flex items-center gap-1`}>
                  {getUrgencyIcon(formData.urgency)}
                  {formData.urgency.charAt(0).toUpperCase() + formData.urgency.slice(1)} Priority
                </Badge>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <Label className="text-sm font-medium text-slate-700">
              Required Skills *
            </Label>
            <div className="mt-2">
              <Dialog open={showSkillsDialog} onOpenChange={setShowSkillsDialog}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Required Skills
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Select Required Skills</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">Common Skills</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {PREDEFINED_SKILLS.map((skill) => (
                          <Button
                            key={skill}
                            type="button"
                            variant={
                              formData.requiredSkills.includes(skill)
                                ? "default" 
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleSkillToggle(skill)}
                            className="justify-start"
                          >
                            {skill}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">Add Custom Skill</h4>
                      <div className="flex gap-2">
                        <Input
                          value={customSkill}
                          onChange={(e) => setCustomSkill(e.target.value)}
                          placeholder="Enter custom skill"
                          onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                        />
                        <Button type="button" onClick={addCustomSkill}>
                          Add
                        </Button>
                      </div>
                    </div>

                    {formData.requiredSkills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 mb-3">Selected Skills ({formData.requiredSkills.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.requiredSkills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1 flex items-center gap-1"
                            >
                              {skill}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-red-100"
                                onClick={() => removeSkill(skill)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {formData.requiredSkills.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 flex items-center gap-1"
                    >
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm mt-2">No skills selected yet</p>
              )}

              {errors.requiredSkills && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-red-500 text-sm">
                    {errors.requiredSkills}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Requirements */}
          <div>
            <Label htmlFor="requirements" className="text-sm font-medium text-slate-700">
              Additional Requirements (Optional)
            </Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="Any special requirements, what to bring, physical demands, etc."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
