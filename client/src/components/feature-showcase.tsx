import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { SiReact, SiNodedotjs, SiPostgresql } from "react-icons/si";

export default function FeatureShowcase() {
  const features = [
    {
      title: "Frontend",
      subtitle: "React + Vite",
      icon: <SiReact className="text-blue-500" size={24} />,
      color: "blue",
      items: [
        "Modern React with Hooks",
        "Vite for Fast Development",
        "Tailwind CSS Styling",
        "Shadcn UI Components",
        "TypeScript Support",
      ],
    },
    {
      title: "Backend",
      subtitle: "Express + Node.js",
      icon: <SiNodedotjs className="text-green-500" size={24} />,
      color: "green",
      items: [
        "RESTful API Design",
        "Express Middleware",
        "Authentication & Authorization",
        "Error Handling",
        "Request Validation",
      ],
    },
    {
      title: "Database",
      subtitle: "PostgreSQL",
      icon: <SiPostgresql className="text-emerald-500" size={24} />,
      color: "emerald",
      items: [
        "Drizzle ORM",
        "Schema Validation",
        "Connection Pooling",
        "Migrations & Seeding",
        "Data Relationships",
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {features.map((feature, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 bg-${feature.color}-100 rounded-lg flex items-center justify-center`}>
                {feature.icon}
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.subtitle}</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              {feature.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-center">
                  <Check className="text-green-500 mr-2" size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
