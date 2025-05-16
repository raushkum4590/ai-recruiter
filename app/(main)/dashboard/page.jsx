import React from 'react'
import Welcome from './_components/Welcome'
import CreateOption from './_components/CreateOption'
import LatestInterViewList from './_components/LatestInterViewList'

function Dashboard() {
  return (
    <div>
        
        <h2 className='text-2xl font-bold my-3'>Dashboard</h2>
        <CreateOption/>
        <LatestInterViewList/>
    </div>
  )
}

export default Dashboard