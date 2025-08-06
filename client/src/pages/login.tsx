"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, Mail, Lock, Heart, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function Login() {
  const [email, setEmail] = useState("contact@oceanguardians.org") // Pre-fill with sample account
  const [password, setPassword] = useState("password123") // Pre-fill with sample password
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
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
          <p className="text-slate-600">Connecting hearts, creating impact</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-teal-600 h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
            <p className="text-slate-600">Sign in to continue your volunteer journey</p>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    placeholder="Enter your email"
                    className="pl-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
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
                    placeholder="Enter your password"
                    className="pl-10 pr-10 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    required
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
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="text-teal-600 hover:text-teal-700 font-medium">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-3 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">New to NGOConnect?</span>
              </div>
            </div>

            <div className="text-center">
              <a href="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                Create your account →
              </a>
            </div>
            
            {/* Sample accounts for testing */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border">
              <p className="text-xs font-medium text-slate-700 mb-2">Sample Accounts (for testing):</p>
              <div className="space-y-1 text-xs text-slate-600">
                <div>
                  <strong>NGO:</strong> contact@oceanguardians.org | password123
                </div>
                <div>
                  <strong>Volunteer:</strong> sarah.johnson@email.com | password123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-slate-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
