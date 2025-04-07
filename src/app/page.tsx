import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <main className="flex flex-col items-center max-w-4xl w-full space-y-10">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white">
          Welcome to AI Design Studio
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Create beautiful designs, posters, graphics, and more with the help of AI.
          Just describe what you want, and our AI assistant will help you build it.
        </p>
        
        <Link href="/design" className="mt-6">
          <Button size="lg">
            Start Designing Now
          </Button>
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-12">
          <Card 
            title="AI-Powered Design" 
            description="Describe your design ideas in natural language, and our AI will help bring them to life."
          >
            <Link href="/design">
              <Button>Try Now</Button>
            </Link>
          </Card>
          
          <Card 
            title="Real HTML & CSS" 
            description="All designs are created using standard web technologies, making them easy to export and use anywhere."
          >
            <Link href="/design">
              <Button variant="secondary">See How It Works</Button>
            </Link>
          </Card>
          
          <Card 
            title="Export Your Designs" 
            description="Export your finished designs as HTML files, ready to be used in your websites or applications."
          >
            <Link href="/design">
              <Button variant="outline">Learn More</Button>
            </Link>
          </Card>
          
          <Card 
            title="Completely Safe" 
            description="All AI-generated designs run in an isolated sandbox, ensuring security and stability."
          >
            <Link href="/design">
              <Button>See Details</Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
