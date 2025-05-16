"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Check, Star, Users, BarChart3, Zap, Menu, X } from 'lucide-react';

export default function IntegratedApp() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Modern animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute top-0 -left-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <HeroSection />
      <Features />
      <Testimonials />
      <UpgradePlan />
      <Footer />
    </div>
  );
}

function HeroSection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setEmail('');
  };

  return (
    <section className="relative min-h-screen flex items-center py-28" id="hero">
      {/* Background with modern gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-sky-50 z-0"></div>
      
      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-200/30 mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-blue-200/20 mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Hero content */}
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            {/* Badge with glass effect */}
            <div className="inline-flex mb-6 rounded-full px-3 py-1 text-sm font-medium backdrop-blur-sm bg-white/70 border border-white/20 shadow-sm text-indigo-800">
              ✨ New AI Features Available Now
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">Revolutionize</span>
              <br /> Your Hiring Process
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-lg font-light">
              Intelligent candidate matching, automated screening, and data-driven insights to transform your recruitment workflow.
            </p>
            
            {/* Modern form with glass effect */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
              <Input
                type="email"
                required
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/70 backdrop-blur-sm border-white/20 focus:border-indigo-500 rounded-lg shadow-sm"
              />
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md transition-all duration-300 rounded-lg" 
                size="lg"
              >
                Start Free Trial <ChevronRight size={16} className="ml-1" />
              </Button>
            </form>
            
            {isSubmitted && (
              <AnimatePresence>
                <motion.div
                  className="mt-4 text-green-600 flex items-center justify-center md:justify-start"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Check size={16} className="mr-1" /> Success! Check your inbox.
                </motion.div>
              </AnimatePresence>
            )}
            
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <Check size={12} className="text-green-600" />
                </div>
                No credit card required
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <Check size={12} className="text-green-600" />
                </div>
                3 free interviews included
              </div>
              <div className="flex items-center text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <Check size={12} className="text-green-600" />
                </div>
                5-minute setup
              </div>
            </div>
          </div>
          
          {/* Hero image */}
          <div className="md:w-1/2">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {/* Glass card effect */}
              <div className="absolute -top-6 -left-6 right-6 bottom-6 rounded-xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl border border-white/30 shadow-xl z-0"></div>
              
              {/* Mock dashboard image */}
              <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl border border-white/20">
                <img 
                  src="/hero.jpg" 
                  alt="AI Recruitment Dashboard" 
                  className="w-full h-auto"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute top-4 right-0 transform translate-x-1/3 bg-white rounded-lg shadow-lg p-3 z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Users size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Matched</div>
                    <div className="text-sm font-medium">94 Candidates</div>
                  </div>
                </div>
              </div>
              
              {/* Floating status */}
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 z-20 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">AI Matching Active</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { 
      icon: <Users size={24} />, 
      color: "from-blue-500 to-indigo-600",
      title: 'AI Matching', 
      desc: 'Proprietary algorithm finds top candidates in seconds, matching skills and culture fit with 95% accuracy.' 
    },
    { 
      icon: <Zap size={24} />, 
      color: "from-violet-500 to-purple-600",
      title: 'Automated Screening', 
      desc: 'Reduce manual screening time by 80% with intelligent resume parsing and smart candidate filtering.' 
    },
    { 
      icon: <BarChart3 size={24} />, 
      color: "from-pink-500 to-rose-600",
      title: 'Analytics Dashboard', 
      desc: 'Data-driven insights to optimize your hiring process, track KPIs, and forecast hiring needs.' 
    }
  ];
  
  return (
    <section id="features" className="py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-96 w-96 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full mix-blend-multiply opacity-50 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-0 bottom-0 h-96 w-96 bg-gradient-to-tr from-blue-50 to-sky-50 rounded-full mix-blend-multiply opacity-50 blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          {/* Badge with glass effect */}
          <div className="inline-flex items-center mb-6 rounded-full px-3 py-1 text-sm font-medium backdrop-blur-sm bg-white/70 shadow-sm border border-indigo-100/30 text-indigo-800">
            <span className="bg-indigo-100 rounded-full w-5 h-5 flex items-center justify-center mr-2">
              <Zap size={12} className="text-indigo-600" />
            </span>
            Innovative Features
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700">
            Powerful AI-Driven Tools
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our intelligent platform streamlines your recruitment process from end to end, saving time and improving candidate quality.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <div className="relative h-full group">
                {/* Glass card effect */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:border-white/40"></div>
                
                <div className="relative p-8 h-full flex flex-col">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 flex-grow">{feature.desc}</p>
                  
                  <div className="mt-auto">
                    <Button 
                      variant="ghost" 
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-0 flex items-center group"
                    >
                      <span>Learn more</span>
                      <div className="ml-2 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-200">
                        <ChevronRight size={14} className="text-indigo-600" />
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Stats section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center shadow-lg"
          >
            <h3 className="text-5xl font-bold text-gray-900 mb-2">95%</h3>
            <p className="text-gray-600">Matching accuracy</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center shadow-lg"
          >
            <h3 className="text-5xl font-bold text-gray-900 mb-2">80%</h3>
            <p className="text-gray-600">Time saved in screening</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/80 to-white/30 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center shadow-lg"
          >
            <h3 className="text-5xl font-bold text-gray-900 mb-2">2x</h3>
            <p className="text-gray-600">Improvement in hire quality</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { 
      name: 'Jane Doe', 
      position: 'HR Director, TechCorp',
      text: 'AIRecruit cut our time-to-hire by 70% and improved our quality of hires dramatically. The AI matching algorithm is incredibly accurate.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5
    },
    { 
      name: 'John Smith', 
      position: 'Talent Acquisition Lead, InnovateCo',
      text: 'The automated screening has been a game-changer for our team. We can now focus on engaging with top candidates instead of sifting through resumes.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 5
    },
    { 
      name: 'Sarah Johnson', 
      position: 'CEO, StartupX',
      text: 'As a fast-growing startup, we needed a solution that could scale with us. AIRecruit has been the perfect partner in our growth journey.',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: 4
    }
  ];
  
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-3 text-sm py-1 px-3 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Testimonials</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Industry Leaders</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">See how companies are transforming their recruitment process with AIRecruit.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-visible">
                <CardContent className="pt-8 relative">
                  <div className="absolute -top-6 left-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                    {[...Array(5 - review.rating)].map((_, i) => (
                      <Star key={i + review.rating} size={16} className="text-gray-300" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 italic mb-6">"{review.text}"</p>
                  
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.position}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            View All Customer Stories <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function UpgradePlan() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free Trial',
      period: '',
      description: 'Perfect for small teams and startups',
      features: [
        '3 candidate screenings',
        'Basic AI matching',
        'Email support',
        '1 user account'
      ],
      buttonText: 'Start Free Trial',
      isPrimary: false
    },
    {
      name: 'Pro',
      price: '$20',
      period: '/month',
      description: 'Ideal for growing companies',
      features: [
        '500 candidate screenings/month',
        'Advanced AI matching',
        'Priority support',
        '5 user accounts',
        'Custom workflow integration'
      ],
      buttonText: 'Start 3 interview trial',
      isPrimary: true
    },
    {
      name: 'Enterprise',
      price: '$50',
      period: '/month',
      description: 'For large organizations',
      features: [
        'Unlimited screenings',
        'Premium AI matching & analytics',
        '24/7 dedicated support',
        'Unlimited users',
        'Custom integrations',
        'Dedicated account manager'
      ],
      buttonText: 'Get Started',
      isPrimary: false
    }
  ];
  
  return (
    <section id="plans" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-3 text-sm py-1 px-3 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose the Right Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Flexible plans designed to fit your recruitment needs, with no hidden fees.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex"
            >
              <Card className={`flex flex-col h-full w-full overflow-hidden border ${
                plan.isPrimary 
                  ? 'border-indigo-500 shadow-lg shadow-indigo-100' 
                  : 'border-gray-200'
              }`}>
                {plan.isPrimary && (
                  <div className="bg-indigo-500 text-white text-center text-sm py-1">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.isPrimary ? 'pb-0' : ''}`}>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4 text-4xl font-bold">
                    {plan.price}
                    {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    className={`w-full ${
                      plan.isPrimary 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-12 text-gray-500 flex items-center justify-center">
          <Check size={16} className="text-green-500 mr-2" />
          All plans include 3 interview free trial. No credit card required.
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const links = {
    Product: ['Features', 'Pricing', 'Case Studies', 'Documentation', 'API'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security', 'Accessibility']
  };
  
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="text-2xl font-bold text-white mb-4">AIRecruit</div>
            <p className="text-gray-400 mb-4 max-w-xs">
              Transforming recruitment with AI-powered candidate matching and automated screening solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 3.992-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-3.992-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} AIRecruit. All rights reserved.</p>
          <p className="mt-4 md:mt-0 text-gray-500 text-sm">
            Made with ❤️ for more efficient hiring
          </p>
        </div>
      </div>
    </footer>
  );
}