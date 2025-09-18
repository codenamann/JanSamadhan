import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComplaint } from '@/context/ComplaintContext';

const Landing = ({ onRoleSelect }) => {
  const { setUserRole } = useComplaint();

  const handleRoleSelect = (role) => {
    setUserRole(role);
    if (onRoleSelect) {
      onRoleSelect(role);
    }
  };

  return (
    <div className="min-h-screen bg-beige-50">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-charcoal-700">
                Jan-Samadhan
              </h1>
            </div>
            <p className="text-charcoal-500 text-sm">
              Citizen Grievance Portal
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-6xl font-black text-charcoal-700 mb-6">
              Report Issues,
              <span className="text-orange-500 block">Get Solutions</span>
            </h2>
            <p className="text-xl text-charcoal-500 mb-12 max-w-3xl mx-auto">
              A real-time platform connecting citizens with authorities to resolve 
              civic issues quickly and efficiently.
            </p>
          </motion.div>

          {/* Role Selection Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {/* Citizen Card */}
            <Card className="group hover:shadow-card transition-all duration-300 cursor-pointer border-2 hover:border-orange-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-charcoal-700">
                  I'm a Citizen
                </CardTitle>
                <p className="text-charcoal-500">
                  Report issues in your area and track their resolution
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 text-sm text-charcoal-600 mb-6">
                  <li className="flex items-center">
                    <Camera className="w-4 h-4 text-orange-500 mr-2" />
                    Take photos of issues
                  </li>
                  <li className="flex items-center">
                    <MapPin className="w-4 h-4 text-orange-500 mr-2" />
                    Share precise location
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-4 h-4 text-orange-500 mr-2" />
                    Track resolution status
                  </li>
                </ul>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  onClick={() => handleRoleSelect('citizen')}
                >
                  Report an Issue
                </Button>
              </CardContent>
            </Card>

            {/* Authority Card */}
            <Card className="group hover:shadow-card transition-all duration-300 cursor-pointer border-2 hover:border-orange-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                  <Shield className="w-8 h-8 text-orange-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-charcoal-700">
                  I'm an Authority
                </CardTitle>
                <p className="text-charcoal-500">
                  Manage and resolve citizen complaints efficiently
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 text-sm text-charcoal-600 mb-6">
                  <li className="flex items-center">
                    <MapPin className="w-4 h-4 text-orange-500 mr-2" />
                    View all complaints on map
                  </li>
                  <li className="flex items-center">
                    <Users className="w-4 h-4 text-orange-500 mr-2" />
                    Assign complaints to team
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-4 h-4 text-orange-500 mr-2" />
                    Mark issues as resolved
                  </li>
                </ul>
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  onClick={() => handleRoleSelect('authority')}
                >
                  Access Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-beige-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-charcoal-700 mb-4">
              How It Works
            </h3>
            <p className="text-charcoal-500 max-w-2xl mx-auto">
              Simple steps to report and resolve civic issues
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Report Issue",
                description: "Take a photo and share your location to report the problem",
                icon: Camera
              },
              {
                step: "2", 
                title: "Authority Review",
                description: "Authorities review and assign the complaint to appropriate team",
                icon: Users
              },
              {
                step: "3",
                title: "Resolution",
                description: "Track progress and get notified when the issue is resolved",
                icon: Shield
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {feature.step}
                </div>
                <feature.icon className="w-8 h-8 text-orange-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-charcoal-700 mb-2">
                  {feature.title}
                </h4>
                <p className="text-charcoal-500">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-charcoal-300">
            © 2024 Jan-Samadhan. Empowering citizens, serving communities.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
