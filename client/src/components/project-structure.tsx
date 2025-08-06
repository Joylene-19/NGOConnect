import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderTree, Folder, File } from "lucide-react";

export default function ProjectStructure() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FolderTree className="mr-2 text-blue-500" size={20} />
          Project Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-sm text-slate-700 space-y-1">
          <div className="flex items-center">
            <Folder className="text-blue-500 mr-2" size={16} />
            <span className="font-semibold">my-fullstack-app/</span>
          </div>
          <div className="ml-4 space-y-1">
            <div className="flex items-center">
              <Folder className="text-blue-500 mr-2" size={16} />
              <span className="font-semibold text-blue-600">client/</span>
              <Badge variant="outline" className="ml-2 text-xs bg-blue-100 text-blue-800">
                React
              </Badge>
            </div>
            <div className="ml-8 space-y-1 text-slate-600">
              <div className="flex items-center">
                <Folder className="text-slate-400 mr-2" size={16} />
                <span>src/</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center">
                  <Folder className="text-slate-400 mr-2" size={16} />
                  <span>components/</span>
                </div>
                <div className="flex items-center">
                  <Folder className="text-slate-400 mr-2" size={16} />
                  <span>pages/</span>
                </div>
                <div className="flex items-center">
                  <Folder className="text-slate-400 mr-2" size={16} />
                  <span>lib/</span>
                </div>
                <div className="flex items-center">
                  <Folder className="text-slate-400 mr-2" size={16} />
                  <span>hooks/</span>
                </div>
              </div>
              <div className="flex items-center">
                <File className="text-slate-400 mr-2" size={16} />
                <span>index.css</span>
              </div>
              <div className="flex items-center">
                <File className="text-slate-400 mr-2" size={16} />
                <span>App.tsx</span>
              </div>
            </div>
            
            <div className="flex items-center mt-3">
              <Folder className="text-green-500 mr-2" size={16} />
              <span className="font-semibold text-green-600">server/</span>
              <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800">
                Express
              </Badge>
            </div>
            <div className="ml-8 space-y-1 text-slate-600">
              <div className="flex items-center">
                <File className="text-slate-400 mr-2" size={16} />
                <span>index.ts</span>
              </div>
              <div className="flex items-center">
                <File className="text-slate-400 mr-2" size={16} />
                <span>routes.ts</span>
              </div>
              <div className="flex items-center">
                <File className="text-slate-400 mr-2" size={16} />
                <span>storage.ts</span>
              </div>
              <div className="flex items-center">
                <File className="text-slate-400 mr-2" size={16} />
                <span>vite.ts</span>
              </div>
            </div>

            <div className="flex items-center mt-3">
              <Folder className="text-purple-500 mr-2" size={16} />
              <span className="font-semibold text-purple-600">shared/</span>
              <Badge variant="outline" className="ml-2 text-xs bg-purple-100 text-purple-800">
                Schema
              </Badge>
            </div>
            <div className="ml-8 space-y-1 text-slate-600">
              <div className="flex items-center">
                <File className="text-slate-400 mr-2" size={16} />
                <span>schema.ts</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
