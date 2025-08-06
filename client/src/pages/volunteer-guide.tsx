import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { ArrowLeft, CheckCircle, Users, Calendar, Award } from "lucide-react"

export default function VolunteerGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Volunteer Guide</h1>
              <p className="text-xl text-slate-600">
                Everything you need to know to get started as a volunteer on NGOConnect
              </p>
            </div>
            
            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mr-2" />
                  Getting Started
                </h2>
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h3 className="font-semibold text-emerald-900 mb-2">Step 1: Create Your Profile</h3>
                    <p>Sign up with your email and create a detailed profile highlighting your skills, interests, and availability.</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <h3 className="font-semibold text-teal-900 mb-2">Step 2: Browse Opportunities</h3>
                    <p>Use our search filters to find volunteer opportunities that match your location, skills, and schedule.</p>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <h3 className="font-semibold text-cyan-900 mb-2">Step 3: Apply and Connect</h3>
                    <p>Apply to opportunities that interest you and connect directly with verified NGOs.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
                  <Calendar className="h-6 w-6 text-emerald-600 mr-2" />
                  Managing Your Volunteer Activity
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Track Hours:</strong> Log your volunteer hours for each activity to build your impact profile.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Communicate:</strong> Stay in touch with NGO coordinators through our messaging system.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Follow Through:</strong> Honor your commitments and notify NGOs if plans change.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Provide Feedback:</strong> Rate and review your experiences to help others.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
                  <Award className="h-6 w-6 text-emerald-600 mr-2" />
                  Earning Recognition
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Certificates</h3>
                    <p className="text-sm">Earn certificates for completing volunteer hours and achieving milestones.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Impact Tracking</h3>
                    <p className="text-sm">See your total contribution hours and the communities you've helped.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Badges</h3>
                    <p className="text-sm">Unlock special badges for different types of volunteer activities.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Recommendations</h3>
                    <p className="text-sm">Get recommendations from NGOs to showcase your volunteer experience.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Best Practices</h2>
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <ul className="space-y-2 text-amber-900">
                    <li>• Be reliable and punctual for your volunteer commitments</li>
                    <li>• Communicate clearly with NGO coordinators</li>
                    <li>• Ask questions if you're unsure about any aspect of the opportunity</li>
                    <li>• Be respectful of beneficiaries and fellow volunteers</li>
                    <li>• Take initiative and suggest improvements when appropriate</li>
                    <li>• Document your experience for personal growth and future applications</li>
                  </ul>
                </div>
              </section>

              <div className="text-center mt-8">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/signup">Start Volunteering Today</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
