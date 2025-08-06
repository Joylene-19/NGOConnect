import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { ArrowLeft, CheckCircle, Building2, Users, Shield, Target } from "lucide-react"

export default function NGOGuide() {
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
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-teal-600" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">NGO Guide</h1>
              <p className="text-xl text-slate-600">
                Learn how to effectively use NGOConnect to find and manage volunteers
              </p>
            </div>
            
            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-teal-600 mr-2" />
                  Getting Verified
                </h2>
                <div className="space-y-4">
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <h3 className="font-semibold text-teal-900 mb-2">Step 1: Submit Documentation</h3>
                    <p>Provide your organization's registration documents, tax-exempt status, and leadership information.</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h3 className="font-semibold text-emerald-900 mb-2">Step 2: Verification Review</h3>
                    <p>Our team will review your application within 3-5 business days.</p>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <h3 className="font-semibold text-cyan-900 mb-2">Step 3: Start Posting</h3>
                    <p>Once verified, you can begin posting volunteer opportunities and managing applications.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
                  <Target className="h-6 w-6 text-teal-600 mr-2" />
                  Creating Effective Opportunities
                </h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Clear Descriptions</h3>
                    <p>Write detailed descriptions of tasks, requirements, and expected outcomes.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Skill Requirements</h3>
                    <p>Specify any required skills, experience levels, or special qualifications.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Time Commitments</h3>
                    <p>Be clear about time expectations, duration, and scheduling flexibility.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Impact Stories</h3>
                    <p>Share how volunteer contributions make a difference in your community.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-teal-600 mr-2" />
                  Managing Volunteers
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Timely Responses:</strong> Respond to volunteer applications within 24-48 hours.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Clear Communication:</strong> Provide clear instructions and regular updates.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Recognition:</strong> Acknowledge volunteer contributions and provide feedback.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Support:</strong> Provide necessary training and resources for volunteers.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Hour Validation:</strong> Verify and approve volunteer hours promptly.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Platform Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-lg border border-teal-200">
                    <h3 className="font-semibold text-teal-900 mb-2">Dashboard Analytics</h3>
                    <p className="text-sm">Track volunteer engagement, hours contributed, and project progress.</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 rounded-lg border border-emerald-200">
                    <h3 className="font-semibold text-emerald-900 mb-2">Messaging System</h3>
                    <p className="text-sm">Communicate directly with volunteers through our secure messaging platform.</p>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                    <h3 className="font-semibold text-cyan-900 mb-2">Certificate Generation</h3>
                    <p className="text-sm">Automatically generate volunteer certificates for completed activities.</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Resource Library</h3>
                    <p className="text-sm">Access templates and best practices for volunteer management.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Success Tips</h2>
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <ul className="space-y-2 text-amber-900">
                    <li>• Post opportunities regularly to maintain visibility</li>
                    <li>• Use high-quality photos to showcase your work</li>
                    <li>• Respond to inquiries promptly and professionally</li>
                    <li>• Provide orientation and training for new volunteers</li>
                    <li>• Share success stories and impact updates</li>
                    <li>• Build long-term relationships with dedicated volunteers</li>
                    <li>• Use feedback to improve your volunteer programs</li>
                  </ul>
                </div>
              </section>

              <div className="text-center mt-8">
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/signup">Register Your NGO</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
