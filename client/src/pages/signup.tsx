"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, Mail, Lock, User, Heart, Building2, Shield, Eye, EyeOff } from "lucide-react"

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"ngo" | "volunteer" | "admin" | "">("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!role) {
      setError("Please select a role")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 409) {
          throw new Error("An account with this email already exists. Please use a different email or try logging in.")
        } else if (response.status === 400) {
          throw new Error("Please check all fields are filled correctly.")
        } else {
          throw new Error(data.error || "Signup failed. Please try again.")
        }
      }

      // Success! Show success message and redirect to login
      setSuccess(`🎉 Account created successfully! Welcome ${data.user.name}! Redirecting to login...`)
      setError("")
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
      
    } catch (err) {
      console.error("Signup error:", err)
      setError(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    {
      value: "volunteer",
      label: "Volunteer",
      description: "Join causes and make a difference",
      icon: Heart,
      color: "from-emerald-500 to-teal-600",
    },
    {
      value: "ngo",
      label: "NGO Organization",
      description: "Post opportunities and manage volunteers",
      icon: Building2,
      color: "from-teal-500 to-cyan-600",
    },
    {
      value: "admin",
      label: "Platform Admin",
      description: "Manage platform and oversee activities",
      icon: Shield,
      color: "from-cyan-500 to-blue-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">NGOConnect</h1>
          <p className="text-slate-600">Start your journey of making impact</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-emerald-600 h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Join NGOConnect</CardTitle>
            <p className="text-slate-600">Create your account and start making a difference</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Enter your email"
                    className="pl-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="pl-10 pr-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500">Minimum 6 characters required</p>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">I want to join as...</Label>
                <div className="space-y-2">
                  {roleOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        role === option.value
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setRole(option.value as typeof role)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${option.color} rounded-lg flex items-center justify-center`}
                        >
                          <option.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{option.label}</h3>
                          <p className="text-sm text-slate-600">{option.description}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            role === option.value ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                          }`}
                        >
                          {role === option.value && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in instead →
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-slate-500">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
