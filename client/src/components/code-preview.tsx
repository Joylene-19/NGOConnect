import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";
import { SiReact, SiNodedotjs } from "react-icons/si";

export default function CodePreview() {
  const frontendCode = `// components/UserCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserCardProps {
  name: string;
  email: string;
}

export default function UserCard({ name, email }: UserCardProps) {
  return (
    <Card className="p-4">
      <CardContent>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-muted-foreground">{email}</p>
        <Button className="mt-2">View Profile</Button>
      </CardContent>
    </Card>
  );
}`;

  const backendCode = `// server/routes.ts
import type { Express } from "express";
import { storage } from "./storage";

export async function registerRoutes(app: Express) {
  // GET /api/users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/users
  app.post('/api/users', async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}`;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Code className="mr-2 text-blue-500" size={20} />
          Sample Components
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Frontend Component */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
              <SiReact className="mr-2 text-blue-500" size={16} />
              Frontend Component (React)
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100 overflow-x-auto">
              <pre className="whitespace-pre-wrap">
                <code>{frontendCode}</code>
              </pre>
            </div>
          </div>

          {/* Backend API Route */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
              <SiNodedotjs className="mr-2 text-green-500" size={16} />
              Backend API Route (Express)
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100 overflow-x-auto">
              <pre className="whitespace-pre-wrap">
                <code>{backendCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
