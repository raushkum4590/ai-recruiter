'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState({
    url: '',
    hostname: '',
    pathname: '',
    origin: '',
    href: '',
    protocol: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDiagnostics({
        url: window.location.toString(),
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        origin: window.location.origin,
        href: window.location.href,
        protocol: window.location.protocol,
      });
    }
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">URL Diagnostics</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current URL Information</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Full URL:</div>
            <div className="col-span-2 break-all bg-gray-50 p-2 rounded">{diagnostics.url}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Origin:</div>
            <div className="col-span-2 break-all bg-gray-50 p-2 rounded">{diagnostics.origin}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Hostname:</div>
            <div className="col-span-2 break-all bg-gray-50 p-2 rounded">{diagnostics.hostname}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Path:</div>
            <div className="col-span-2 break-all bg-gray-50 p-2 rounded">{diagnostics.pathname}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-medium">Protocol:</div>
            <div className="col-span-2 break-all bg-gray-50 p-2 rounded">{diagnostics.protocol}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Interview Links</h2>
        <p className="mb-4">Click to test interview links with a sample ID:</p>
        
        <div className="space-y-4">
          <div>
            <div className="font-medium mb-2">Using pathname:</div>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 p-2 flex-1 rounded">/interview/test-id</code>
              <Button 
                onClick={() => window.location.href = '/interview/test-id'}
                variant="outline"
              >
                Test
              </Button>
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2">Using absolute URL:</div>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 p-2 flex-1 rounded">
                {typeof window !== 'undefined' ? `${window.location.origin}/interview/test-id` : ''}
              </code>
              <Button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = `${window.location.origin}/interview/test-id`;
                  }
                }}
                variant="outline"
              >
                Test
              </Button>
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2">Using hardcoded Vercel URL:</div>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 p-2 flex-1 rounded">
                https://ai-recruiter-nu.vercel.app/interview/test-id
              </code>
              <Button 
                onClick={() => window.location.href = 'https://ai-recruiter-nu.vercel.app/interview/test-id'}
                variant="outline"
              >
                Test
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-500 text-sm">
        This diagnostic page helps identify URL routing issues in different environments.
      </p>
    </div>
  );
}
