import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>
            
            <div className="space-y-6 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Acceptance of Terms</h2>
                <p>
                  By accessing and using NGOConnect, you accept and agree to be bound by the terms and provision of this agreement. 
                  These terms apply to all users of the platform, including volunteers, NGOs, and administrators.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">User Responsibilities</h2>
                <p className="mb-4">As a user of NGOConnect, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Use the platform responsibly and lawfully</li>
                  <li>Respect other users and maintain professional conduct</li>
                  <li>Honor volunteer commitments made through the platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Platform Usage</h2>
                <p className="mb-4">NGOConnect provides a platform to connect volunteers with NGOs. Users may:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Create profiles and search for opportunities</li>
                  <li>Communicate with verified organizations</li>
                  <li>Track volunteer hours and earn certificates</li>
                  <li>Access educational resources and support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Prohibited Activities</h2>
                <p className="mb-4">Users may not:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Spam, harass, or abuse other users</li>
                  <li>Attempt to gain unauthorized access to the platform</li>
                  <li>Post malicious content or engage in fraudulent activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Account Termination</h2>
                <p>
                  We reserve the right to terminate or suspend accounts that violate these terms or engage in harmful behavior. 
                  Users may also delete their accounts at any time through their profile settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Limitation of Liability</h2>
                <p>
                  NGOConnect serves as a platform to facilitate connections between volunteers and NGOs. We are not responsible 
                  for the actions or conduct of users, the quality of volunteer opportunities, or any disputes that may arise.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to Terms</h2>
                <p>
                  We may update these terms from time to time. Continued use of the platform constitutes acceptance of any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us at legal@ngoconnect.org
                </p>
              </section>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
