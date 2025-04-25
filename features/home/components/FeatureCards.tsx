import { Globe, Upload, BarChart3, Bot } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow flex flex-col">
      <div className="text-emerald-600 dark:text-emerald-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
}

export function FeatureCards() {
  const features = [
    {
      title: "Interactive Maps",
      description:
        "Explore and interact with global maps. Zoom, pan, and navigate geospatial data with ease.",
      icon: <Globe size={24} />,
    },
    {
      title: "Data Upload",
      description:
        "Import your own geospatial data in various formats like Shapefile, GeoJSON, and CSV.",
      icon: <Upload size={24} />,
    },
    {
      title: "Analysis Tools",
      description:
        "Perform spatial analyses, calculate statistics, and generate insights from your data.",
      icon: <BarChart3 size={24} />,
    },
    {
      title: "AI Assistant",
      description:
        "Get help from our AI assistant to answer questions and discover patterns in your data.",
      icon: <Bot size={24} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
        />
      ))}
    </div>
  );
}
