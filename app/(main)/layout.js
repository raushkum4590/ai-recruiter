import React from 'react'
import Dashboardprovider from './provider'

function DashboardLayout({ children }) {
  return (
    <div>
        <Dashboardprovider>
            <div className='p-10'>


            
        {children}
            </div>
        </Dashboardprovider>
    </div>
  )
}

export default DashboardLayout