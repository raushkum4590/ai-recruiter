"use client"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React, { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { InterviewType } from '@/services/constants'
import { Button } from '@/components/ui/button'
import { ArrowRight, Briefcase, FileText, Clock, Tag } from 'lucide-react'

function FormField({ onHandleInputChange, GoToNext }) {
    const [interviewType, setInterviewType] = useState([]);

    const handleInterviewTypeClick = (typeName) => {
        setInterviewType([typeName]);
        onHandleInputChange('type', typeName);
    };

    return (
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-7'>

            {/* Job Position */}
            <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                    <Briefcase className='h-4 w-4 text-blue-500' />
                    Job Position
                </label>
                <Input
                    placeholder="e.g. Full Stack Developer, UX Designer, Data Scientist"
                    className='h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400'
                    onChange={(e) => onHandleInputChange('jobPosition', e.target.value)}
                />
            </div>

            {/* Job Description */}
            <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                    <FileText className='h-4 w-4 text-blue-500' />
                    Job Description
                </label>
                <p className='text-xs text-gray-400'>Include key skills, responsibilities, and requirements</p>
                <Textarea
                    placeholder="e.g. 3+ years React experience, Node.js, REST APIs, team collaboration..."
                    className='h-36 border-gray-200 focus:border-blue-400 resize-none'
                    onChange={(e) => onHandleInputChange('jobDescription', e.target.value)}
                />
            </div>

            {/* Duration */}
            <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                    <Clock className='h-4 w-4 text-blue-500' />
                    Interview Duration
                </label>
                <Select onValueChange={(value) => onHandleInputChange('duration', value.split(' ')[0])}>
                    <SelectTrigger className='h-11 border-gray-200 w-full'>
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        {[2, 10, 15, 30, 60].map(m => (
                            <SelectItem key={m} value={`${m} Min`}>{m} minutes</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Interview Type */}
            <div className='space-y-3'>
                <label className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
                    <Tag className='h-4 w-4 text-blue-500' />
                    Interview Type
                </label>
                <div className='flex gap-3 flex-wrap'>
                    {InterviewType.map((type, index) => {
                        const Icon = type.icon;
                        const selected = interviewType.includes(type.title);
                        return (
                            <button
                                key={index}
                                type='button'
                                onClick={() => handleInterviewTypeClick(type.title)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200
                                    ${selected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                                <Icon className='h-4 w-4' />
                                {type.title}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className='flex justify-end pt-2'>
                <Button
                    onClick={GoToNext}
                    className='bg-blue-600 hover:bg-blue-700 h-11 px-8 text-sm font-semibold rounded-xl'
                >
                    Generate Questions
                    <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
            </div>
        </div>
    )
}

export default FormField
