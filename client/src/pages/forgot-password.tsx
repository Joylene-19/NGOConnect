"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, Heart, CheckCircle } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // API call to send reset password email
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setEmailSent(true)
      setSuccess("Password reset instructions have been sent to your email address.")
      
    } catch (err) {
      console.error("Forgot password error:", err)
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">NGOConnect</h1>
          <p className="text-slate-600">Reset your password</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              {emailSent ? (
                <CheckCircle className="text-green-600 h-6 w-6" />
              ) : (
                <Mail className="text-teal-600 h-6 w-6" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {emailSent ? "Check Your Email" : "Forgot Password?"}
            </CardTitle>
            <p className="text-slate-600">
              {emailSent 
                ? "We've sent password reset instructions to your email address."
                : "Enter your email address and we'll send you instructions to reset your password."
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-3 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="text-center text-sm text-slate-600">
                  <p>Didn't receive the email? Check your spam folder or try again.</p>
                </div>
                
                <Button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail("")
                    setSuccess("")
                    setError("")
                  }}
                  variant="outline"
                  className="w-full border-slate-200 hover:bg-slate-50"
                >
                  Try Again
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Remember your password?</span>
              </div>
            </div>

            <Button
              onClick={handleBackToLogin}
              variant="ghost"
              className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-slate-500">
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </div>
  )
}
