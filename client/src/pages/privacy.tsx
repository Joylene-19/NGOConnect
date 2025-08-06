import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
            
            <div className="space-y-6 text-slate-700">
              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>
                <p className="mb-4">
                  At NGOConnect, we collect information that you provide directly to us, such as when you create an account, 
                  update your profile, or communicate with us. This may include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name, email address, and contact information</li>
                  <li>Profile information including skills, interests, and location</li>
                  <li>Volunteer activity and participation records</li>
                  <li>Communication preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and improve our services</li>
                  <li>Connect volunteers with appropriate opportunities</li>
                  <li>Send important updates and notifications</li>
                  <li>Generate certificates and track volunteer hours</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                  except as described in this policy. We may share your information with verified NGO partners for the purpose 
                  of volunteer coordination.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at privacy@ngoconnect.org
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
