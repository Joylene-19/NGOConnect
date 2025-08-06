import { useState } from "react"
import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heart, Menu, X, User, Settings, LogOut, Bell } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface NavigationProps {
  user?: {
    name: string
    email: string
    role: "volunteer" | "ngo" | "admin"
    avatar?: string
  }
}

export default function Navigation({ user: propUser }: NavigationProps) {
  const { user: authUser, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [location, setLocation] = useLocation()
  
  // Use auth user if available, otherwise use prop user (for non-authenticated pages)
  const user = authUser || propUser

  const navItems = [
    { label: "Home", href: "/", isSection: false },
    { label: "Opportunities", href: "#opportunities", isSection: true },
    { label: "About", href: "#about", isSection: true },
    { label: "Contact", href: "#contact", isSection: true },
  ]

  const handleNavClick = (href: string, isSection: boolean) => {
    if (isSection && location === "/") {
      // If we're on the home page and it's a section link, scroll to section
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else if (isSection) {
      // If we're not on home page but want to go to a section, go to home first
      setLocation("/")
      setTimeout(() => {
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      // Regular navigation
      setLocation(href)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "volunteer":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "ngo":
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getDashboardLink = (role: string) => {
    switch (role) {
      case "volunteer":
        return "/volunteer-dashboard"
      case "ngo":
        return "/ngo-dashboard"
      case "admin":
        return "/admin-dashboard"
      default:
        return "/dashboard"
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Heart className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">NGOConnect</h1>
                <p className="text-xs text-slate-600 hidden sm:block">Connecting Hearts, Creating Impact</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href, item.isSection)}
                className="text-slate-600 hover:text-teal-600 font-medium transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user && user.name ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={(user as any).avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                        <AvatarFallback className="bg-teal-100 text-teal-700">
                          {user?.name
                            ? user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-slate-900">{user?.name || "User"}</p>
                        <Badge className={`${getRoleColor(user?.role || "user")} text-xs`}>{user?.role || "user"}</Badge>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-slate-500">{user?.email || "user@example.com"}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink(user?.role || "user")} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                  asChild
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    handleNavClick(item.href, item.isSection)
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-slate-600 hover:text-teal-600 font-medium transition-colors"
                >
                  {item.label}
                </button>
              ))}
              {!user && (
                <div className="pt-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
