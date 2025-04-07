import Card from "@/components/Card";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Features</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover what makes our application powerful and easy to use
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card
            title="Responsive Design"
            description="Create designs that look great on any device with our responsive design tools."
          />
          <Card
            title="Component Library"
            description="Access a wide range of pre-built components to speed up your development process."
          />
          <Card
            title="Custom Themes"
            description="Create and apply custom themes to maintain consistent branding across your projects."
          />
          <Card
            title="Collaboration"
            description="Work together with your team in real-time with our collaborative editing features."
          />
          <Card
            title="Asset Management"
            description="Easily organize and manage all your design assets in one centralized location."
          />
          <Card
            title="Export Options"
            description="Export your designs in various formats suitable for different platforms and mediums."
          />
        </div>
      </div>
    </div>
  );
} 