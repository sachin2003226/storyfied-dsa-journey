
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Trophy, Users, Star, ArrowRight, Code, Brain, Target } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Data Structures &{' '}
            <span className="text-blue-600">Algorithms</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Embark on your coding journey with our comprehensive, story-driven approach to learning DSA. 
            From beginner to expert, we'll guide you every step of the way.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Continue Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Learning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose DSA Journey?
          </h2>
          <p className="text-lg text-gray-600">
            Our unique approach makes learning algorithms engaging and effective
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Story-Driven Learning</CardTitle>
              <CardDescription>
                Learn through engaging narratives that make complex concepts easy to understand and remember
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Interactive Coding</CardTitle>
              <CardDescription>
                Practice with real code examples and interactive exercises that reinforce your learning
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Monitor your learning journey with detailed progress tracking and achievement badges
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Topics Preview */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What You'll Learn
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive curriculum covering all essential data structures and algorithms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📊', name: 'Arrays', desc: 'Foundation of data structures' },
              { icon: '🔗', name: 'Linked Lists', desc: 'Dynamic data organization' },
              { icon: '🌳', name: 'Trees', desc: 'Hierarchical data structures' },
              { icon: '🕸️', name: 'Graphs', desc: 'Complex relationships' },
              { icon: '🔄', name: 'Sorting', desc: 'Efficient data ordering' },
              { icon: '🔍', name: 'Searching', desc: 'Quick data retrieval' },
              { icon: '💡', name: 'Dynamic Programming', desc: 'Optimization techniques' },
              { icon: '📚', name: 'Stacks & Queues', desc: 'LIFO and FIFO structures' }
            ].map((topic, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-3xl mb-2">{topic.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{topic.name}</h3>
                  <p className="text-sm text-gray-600">{topic.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Interactive Lessons</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">8</div>
              <div className="text-blue-200">Core Topics</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-blue-200">Practice Problems</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Learning Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of learners who have mastered data structures and algorithms with our platform
          </p>
          
          {!user && (
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
