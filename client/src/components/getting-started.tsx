import { Card, CardContent } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export default function GettingStarted() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mt-8">
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Development Setup</h3>
            <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100">
              <div className="text-green-400"># Install dependencies</div>
              <div className="text-white">npm install</div>
              <br />
              <div className="text-green-400"># Start development server</div>
              <div className="text-white">npm run dev</div>
              <br />
              <div className="text-green-400"># Server runs on port 5000</div>
              <div className="text-green-400"># Serves both frontend and backend</div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Commands</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Terminal className="mr-2 text-blue-500" size={16} />
                <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">npm run build</code>
                <span className="ml-2 text-slate-600">- Build for production</span>
              </div>
              <div className="flex items-center">
                <Terminal className="mr-2 text-blue-500" size={16} />
                <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">npm run start</code>
                <span className="ml-2 text-slate-600">- Start production server</span>
              </div>
              <div className="flex items-center">
                <Terminal className="mr-2 text-blue-500" size={16} />
                <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">npm run db:push</code>
                <span className="ml-2 text-slate-600">- Push database schema</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
