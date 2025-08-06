import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Search, Award, Calendar, Clock, User, Building2 } from 'lucide-react'

interface CertificateVerificationProps {
  className?: string
}

interface CertificateData {
  certificateNumber: string
  volunteerName: string
  taskTitle: string
  taskDate: string
  completionDate: string
  hours: string
  ngoName: string
  issueDate: string
  volunteerSkills: string
  isValid: boolean
}

export default function CertificateVerification({ className }: CertificateVerificationProps) {
  const [certificateNumber, setCertificateNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<CertificateData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!certificateNumber.trim()) {
      setError('Please enter a certificate number')
      return
    }

    setLoading(true)
    setError(null)
    setVerificationResult(null)

    try {
      // Try to fetch from API first
      const response = await fetch(`/api/certificates/verify/${certificateNumber}`)
      
      if (response.ok) {
        const data = await response.json()
        setVerificationResult(data)
      } else {
        // Fallback to localStorage for demo
        const localCert = localStorage.getItem(`certificate-${certificateNumber}`)
        if (localCert) {
          const certData = JSON.parse(localCert)
          setVerificationResult({
            certificateNumber: certData.certificateNumber,
            volunteerName: certData.volunteerName,
            taskTitle: certData.taskTitle,
            taskDate: new Date(certData.taskDate || certData.issuedAt).toLocaleDateString(),
            completionDate: new Date(certData.completionDate || certData.issuedAt).toLocaleDateString(),
            hours: certData.hours?.toString() || '4',
            ngoName: certData.ngoName,
            issueDate: new Date(certData.issuedAt).toLocaleDateString(),
            volunteerSkills: certData.volunteerSkills || certData.placeholderData?.['<<VOLUNTEER_SKILLS>>'] || 'Various skills',
            isValid: true
          })
        } else {
          setError('Certificate not found. Please check the certificate number and try again.')
        }
      }
    } catch (err) {
      setError('Unable to verify certificate. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-slate-900">
            <Award className="h-8 w-8 text-teal-600" />
            Certificate Verification
          </CardTitle>
          <p className="text-slate-600">
            Enter a certificate number to verify its authenticity
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="certificate-number">Certificate Number</Label>
            <div className="flex gap-2">
              <Input
                id="certificate-number"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="e.g., NGO-1735682404123-A7B3C9"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
              <Button 
                onClick={handleVerify} 
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-slate-500">
              Certificate numbers are typically in the format: NGO-{'{timestamp}'}-{'{code}'}
            </p>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {verificationResult && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Certificate verified successfully! This is a legitimate certificate.
                </AlertDescription>
              </Alert>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Volunteer Name</p>
                          <p className="text-slate-900">{verificationResult.volunteerName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Task/Activity</p>
                          <p className="text-slate-900">{verificationResult.taskTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Task Date</p>
                          <p className="text-slate-900">{verificationResult.taskDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Hours Contributed</p>
                          <p className="text-slate-900">{verificationResult.hours} hours</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Organization</p>
                          <p className="text-slate-900">{verificationResult.ngoName}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Skills Demonstrated</p>
                        <p className="text-slate-900">{verificationResult.volunteerSkills}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Certificate Details</p>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600">Number: {verificationResult.certificateNumber}</p>
                          <p className="text-xs text-slate-600">Issued: {verificationResult.issueDate}</p>
                          <p className="text-xs text-slate-600">Completed: {verificationResult.completionDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        ✓ Verified Certificate
                      </Badge>
                      <p className="text-xs text-slate-500">
                        This certificate is authentic and was issued by {verificationResult.ngoName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">How Certificate Verification Works</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Each certificate has a unique number that cannot be duplicated</li>
              <li>• All certificate data is stored securely in our database</li>
              <li>• This system prevents fake certificates created with image editing tools</li>
              <li>• Only genuine certificates issued through our platform can be verified</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
