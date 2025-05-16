"use client"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { InterviewType } from '@/services/constants'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
  
function FormField({ onHandleInputChange, GoToNext }) {
    const [interviewType, setInterviewType] = useState([]);
    
    // Fix: Only update when interviewType actually changes and has values
    useEffect(() => {
        // Only call onHandleInputChange if interviewType is not empty
        if (interviewType && interviewType.length > 0) {
            onHandleInputChange('type', interviewType);
        }
    }, [interviewType]); // Intentionally removing onHandleInputChange from deps to prevent loop

    const handleInterviewTypeClick = (typeName) => {
        // Check if type is already selected to avoid duplicates
        if (!interviewType.includes(typeName)) {
            setInterviewType(prev => [...prev, typeName]);
        }
    };

    return (
        <div className='p-5 shadow-md rounded-lg'>
            <div>
                <h2 className='text-sm font-medium'>Job Position</h2>
                <Input 
                    placeholder="e.g. Full Stack Developer" 
                    className='mt-2'
                    onChange={(event) => onHandleInputChange('jobPosition', event.target.value)}
                />
            </div>
            
            <div className='mt-5'>
                <h2 className='text-sm font-medium'>Job Description</h2>
                <Textarea 
                    placeholder="enter Detail job Description" 
                    className='h-[200px] mt-2'
                    onChange={(event) => onHandleInputChange('jobDescription', event.target.value)}
                />
            </div>
            
            <div className='mt-5'>
                <h2 className='text-sm font-medium'>Interview Duration</h2>
                <Select onValueChange={(value) => onHandleInputChange('duration', value)}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2 Min">2 Min</SelectItem>
                        <SelectItem value="10 Min">10 Min</SelectItem>
                        <SelectItem value="15 Min">15 Min</SelectItem>
                        <SelectItem value="30 Min">30 Min</SelectItem>
                        <SelectItem value="60 Min">60 Min</SelectItem>
                    </SelectContent>
                </Select>
                
                <div className='mt-5'>
                    <h2 className='text-sm font-medium'>Interview Types</h2>
                    <div className='flex gap-3 flex-wrap mt-2'>
                        {InterviewType.map((type, index) => {
                            // Dynamically use the icon component
                            const IconComponent = type.icon;
                            
                            return (
                                <div 
                                    key={index} 
                                    className={`flex items-center gap-2 p-1 px-2 bg-white shadow-md border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-200
                                        ${interviewType.includes(type.title) ? 'bg-blue-100 text-blue-400' : ''}`}
                                    onClick={() => handleInterviewTypeClick(type.title)}
                                >
                                    <IconComponent className='h-6 w-6' />
                                    <span>{type.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className='mt-7 flex justify-end'>
                <Button onClick={GoToNext}>Generate Question<ArrowRight /></Button>
            </div>
        </div>
    )
}

export default FormField