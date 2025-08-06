import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { ArrowLeft, Heart, Mail, Phone, MessageCircle, HelpCircle, Bug, Settings } from "lucide-react"

export default function GeneralSupport() {
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
              <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-cyan-600" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">General Support</h1>
              <p className="text-xl text-slate-600">
                Get help with account management, technical issues, and platform features
              </p>
            </div>
            
            <div className="space-y-8 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">Contact Support</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-cyan-200">
                    <CardContent className="p-6 text-center">
                      <Mail className="h-8 w-8 text-cyan-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
                      <p className="text-sm text-slate-600 mb-4">Get help via email within 24 hours</p>
                      <Button variant="outline" className="w-full">
                        support@ngoconnect.org
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-200">
                    <CardContent className="p-6 text-center">
                      <MessageCircle className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">Live Chat</h3>
                      <p className="text-sm text-slate-600 mb-4">Chat with us during business hours</p>
                      <Button variant="outline" className="w-full">
                        Start Chat
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-teal-200">
                    <CardContent className="p-6 text-center">
                      <Phone className="h-8 w-8 text-teal-600 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">Phone Support</h3>
                      <p className="text-sm text-slate-600 mb-4">Call us Mon-Fri 9AM-6PM EST</p>
                      <Button variant="outline" className="w-full">
                        +1 (555) 123-4567
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">Common Issues</h2>
                <div className="space-y-4">
                  <Card className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Settings className="h-6 w-6 text-slate-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Account Management</h3>
                          <p className="text-slate-600 mb-3">Issues with login, password reset, profile updates, or account deletion.</p>
                          <div className="space-y-1 text-sm text-slate-500">
                            <p>• Forgot password? Use the "Reset Password" link on the login page</p>
                            <p>• Update profile information in your dashboard settings</p>
                            <p>• Contact support for account deletion requests</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Bug className="h-6 w-6 text-slate-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Technical Issues</h3>
                          <p className="text-slate-600 mb-3">Platform bugs, loading problems, or feature malfunctions.</p>
                          <div className="space-y-1 text-sm text-slate-500">
                            <p>• Clear your browser cache and cookies</p>
                            <p>• Try accessing the platform from a different browser</p>
                            <p>• Check your internet connection</p>
                            <p>• Report persistent issues to our technical team</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <HelpCircle className="h-6 w-6 text-slate-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">Platform Features</h3>
                          <p className="text-slate-600 mb-3">Questions about how to use specific platform features.</p>
                          <div className="space-y-1 text-sm text-slate-500">
                            <p>• Check our volunteer and NGO guides for detailed instructions</p>
                            <p>• Use the search function to find specific opportunities</p>
                            <p>• Access your dashboard for activity tracking and management</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">How do I get verified as an NGO?</h3>
                    <p className="text-slate-700">Submit your organization's documentation through the verification process in your NGO dashboard. Review typically takes 3-5 business days.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Can I volunteer for multiple organizations?</h3>
                    <p className="text-slate-700">Yes! You can apply to and volunteer for as many organizations as your schedule allows. Track all your activities in your volunteer dashboard.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">How do I get a volunteer certificate?</h3>
                    <p className="text-slate-700">Certificates are automatically generated once you complete volunteer hours and the NGO validates your participation.</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Is NGOConnect free to use?</h3>
                    <p className="text-slate-700">Yes! NGOConnect is completely free for both volunteers and NGOs. Our mission is to facilitate meaningful connections for social good.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Report an Issue</h2>
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">Security or Safety Concerns</h3>
                  <p className="text-red-800 mb-4">
                    If you encounter any security issues, inappropriate behavior, or safety concerns, please report them immediately.
                  </p>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Report Issue
                  </Button>
                </div>
              </section>

              <div className="text-center mt-8">
                <p className="text-slate-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help!
                </p>
                <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-700">
                  <a href="mailto:support@ngoconnect.org">Contact Support</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
