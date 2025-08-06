import { Button } from "@/components/ui/button";
import { Code, Play, Settings } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Code className="text-white" size={16} />
              </div>
              <span className="text-xl font-bold text-slate-900">DevStack</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#" className="text-slate-900 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                  Overview
                </a>
                <a href="#" className="text-slate-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                  Structure
                </a>
                <a href="#" className="text-slate-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                  Components
                </a>
                <a href="#" className="text-slate-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium">
                  API
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Play size={16} className="mr-2" />
              Run Project
            </Button>
            <Button variant="ghost" size="icon">
              <Settings size={18} className="text-slate-600" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
