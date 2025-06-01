import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { FaFileAlt, FaShieldAlt, FaUserLock } from 'react-icons/fa';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <span className="text-xl font-semibold text-gray-900">
                  Seva Portal
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <a className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-16">
          {/* Hero */}
          <div className="relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
              >
                <span className="block">Seva Portal</span>
                <span className="block text-blue-600">Secure Document Management System</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
              >
                A centralized platform for managing and processing government documents securely and efficiently.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12"
              >
                <Link href="/login">
                  <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Get Started
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Features */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="relative group"
                >
                  <div className="h-full bg-white rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-2xl p-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                        <FaFileAlt className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Document Storage</h3>
                      <p className="text-gray-500">
                        Store and manage sensitive documents with enterprise-grade security and encryption.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="relative group"
                >
                  <div className="h-full bg-white rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-2xl p-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                        <FaShieldAlt className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Security</h3>
                      <p className="text-gray-500">
                        Multi-factor authentication and role-based access control for maximum protection.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="relative group sm:col-span-2 lg:col-span-1"
                >
                  <div className="h-full bg-white rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-2xl p-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                        <FaUserLock className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Authorized Access</h3>
                      <p className="text-gray-500">
                        Secure authentication system with Aadhaar-based verification.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Seva Portal. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;