import Image from 'next/image'
import React from 'react'

function InterviewHeader() {
  return (
    <div className='p-4 shadow-md'>
        <Image src={'/logo.svg'} alt='logo' width={200} height={100} className='w-[140px] '/>
    </div>
  )
}

export default InterviewHeader