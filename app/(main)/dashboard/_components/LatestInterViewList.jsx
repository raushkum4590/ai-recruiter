"use client"
import { useUser } from '@/app/provider'
import { Button } from '@/components/ui/button'
import { supabase } from '@/services/superbaseClient'
import { Video, Plus, ArrowRight, Filter, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import InterviewCard from './InterviewCard'
import Link from 'next/link'

function LatestInterViewList() {
    const [interviewList, setInterviewList] = useState([])
    const [loading, setLoading] = useState(true)
    const {user}=useUser();

    useEffect(()=>{
      user && GetInterviewList();
    }, [user])
    
    const GetInterviewList=async()=>{
      setLoading(true)
      try {
        let { data: Interviews, error } = await supabase
        .from('Interviews')
        .select('*')
        .eq('userEmail', user?.email)
        .order('id',{ascending:false})
        .limit(8)
      
        if (error) throw error;
        setInterviewList(Interviews || []);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    }

   
  return (
    <div className="space-y-6"> 
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Recent Interviews</h2>
          <p className="text-gray-600 mt-1">Manage and track your interview sessions</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Link href="/dashboard/create-interview">
            <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>Create Interview</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && interviewList?.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Video className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No interviews yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first AI-powered interview. It only takes a few minutes to set up.
            </p>
            <Link href="/dashboard/create-interview">
              <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>Create Your First Interview</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Interview Grid */}
      {!loading && interviewList && interviewList.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {interviewList.map((interview, index) => (
              <InterviewCard interview={interview} key={index} />
            ))}
          </div>
          
          {/* View All Button */}
          {interviewList.length >= 8 && (
            <div className="text-center pt-6">
              <Link href="/dashboard/all-interview">
                <Button variant="outline" className="flex items-center space-x-2 mx-auto">
                  <span>View All Interviews</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LatestInterViewList