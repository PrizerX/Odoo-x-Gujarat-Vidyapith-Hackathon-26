import Link from "next/link";
import { Truck, BarChart3, Users, Wrench, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#714b67' }}>
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold" style={{ color: '#714b67' }}>
                FleetFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: '#714b67' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6" style={{ color: '#714b67' }}>
            Modernize Your Fleet Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            FleetFlow replaces manual logbooks with an intelligent, offline-first ERP system. 
            Track vehicles, manage drivers, monitor expenses, and optimize operations—all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-lg text-white font-semibold text-lg transition-transform hover:scale-105"
              style={{ backgroundColor: '#714b67' }}
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-lg border-2 font-semibold text-lg transition-colors hover:bg-gray-50"
              style={{ borderColor: '#714b67', color: '#714b67' }}
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#714b67' }}>
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#714b67' }}>
              Vehicle Registry
            </h3>
            <p className="text-gray-600">
              Complete CRUD operations for all assets. Track capacity, status, and retirement with intelligent toggles.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#714b67' }}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#714b67' }}>
              Driver Management
            </h3>
            <p className="text-gray-600">
              Compliance tracking with license expiry checks. Automatic blocking for expired credentials.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#714b67' }}>
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#714b67' }}>
              Analytics Hub
            </h3>
            <p className="text-gray-600">
              Real-time insights on fuel efficiency, vehicle ROI, and operational performance metrics.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#714b67' }}>
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#714b67' }}>
              Service Tracking
            </h3>
            <p className="text-gray-600">
              Maintenance logs that auto-update vehicle status and manage shop workflows seamlessly.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#714b67' }}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#714b67' }}>
              Strict Validation
            </h3>
            <p className="text-gray-600">
              Business logic enforcement with cargo capacity checks and compliance rules built-in.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#714b67' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#714b67' }}>
              Offline First
            </h3>
            <p className="text-gray-600">
              Work anywhere with browser-based database. No internet required for daily operations.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#714b67' }}>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Fleet Operations?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join modern logistics companies using FleetFlow to eliminate paperwork and boost efficiency.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white rounded-lg font-semibold text-lg transition-transform hover:scale-105"
            style={{ color: '#714b67' }}
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#714b67' }}>
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">FleetFlow</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2026 FleetFlow. Odoo x Gujarat Vidyapith Hackathon
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
