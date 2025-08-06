"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home, ArrowLeft, Heart } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Logo/Brand Section */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="text-white h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">NGOConnect</h1>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">404</h2>
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Page Not Found</h3>

            <p className="text-slate-600 mb-6">
              The page you're looking for doesn't exist or has been moved. Let's get you back to making a difference!
            </p>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>

              <Button
                variant="outline"
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 bg-transparent"
                onClick={() => (window.location.href = "/")}
              >
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Need help? Contact our support team or check if the page URL is correct.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
