import React from 'react';
import { Heart, Users, Pill, Calendar, Shield, Github, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const About: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
          About Sushruta
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          A comprehensive family medicine tracker designed to help you manage medications 
          for all your family members with precision and care.
        </p>
      </div>

      {/* Named After Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-500" />
            Named After a Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              <strong>Sushruta</strong> was an ancient Indian physician and surgeon, often called the 
              "Father of Surgery" and "Father of Plastic Surgery." His groundbreaking work, the 
              <em> Sushruta Samhita</em>, documented surgical techniques and medical knowledge that 
              continue to influence modern healthcare practices over 2,000 years later.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Just as Sushruta revolutionized medicine with systematic documentation and careful 
              attention to detail, this application brings that same meticulous care to tracking 
              your family's medication needs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Family Management</h3>
            <p className="text-sm text-gray-600">
              Track medications for all family members with personalized profiles and attributes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Pill className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Medication Tracking</h3>
            <p className="text-sm text-gray-600">
              Comprehensive medication inventory with dosages, frequencies, and instructions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
            <p className="text-sm text-gray-600">
              Daily medication schedules with prescription management and compliance tracking.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reliable & Secure</h3>
            <p className="text-sm text-gray-600">
              Built with modern security practices and reliable technology to keep your family's health data safe.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality & Development */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Built for Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Sushruta is built with modern development practices focused on reliability, 
              maintainability, and user experience. Every component is designed with 
              attention to detail and thorough testing.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Comprehensive test coverage</span>
              </div>
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Type-safe development</span>
              </div>
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Mobile-responsive design</span>
              </div>
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Modern security practices</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Github className="h-5 w-5 mr-2" />
              Development Excellence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Sushruta follows industry best practices for software development, focusing on 
              code quality, security, and user experience. Every feature is built with 
              attention to detail and rigorous testing standards.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Rigorous quality assurance</span>
              </div>
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Continuous security updates</span>
              </div>
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Cross-platform compatibility</span>
              </div>
              <div className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-600">Intuitive user interface</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Philosophy */}
      <Card>
        <CardHeader>
          <CardTitle>Our Philosophy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Healthcare is deeply personal. Sushruta is designed to provide the tools you need 
              to manage complex medication schedules with confidence and precision. Our approach 
              focuses on clarity, organization, and ease of use for families managing multiple 
              medication regimens.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Whether you're caring for elderly parents, managing pet medications, or coordinating 
              treatments for multiple family members, Sushruta provides the structure and clarity 
              you need to keep everyone healthy and on track.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-sm text-gray-500">
            <p>Sushruta Medicine Tracker</p>
            <p className="mt-1">Built with ❤️ for families who care</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;