import { Filter, X } from 'lucide-react'
import React from 'react'

const FilterSidebar = ({showFilterPhone,setShowFilterPhone,filters,setFilters}) => {
  return (
    <div className={`${showFilterPhone?"max-sm:fixed":"max-sm:hidden"} max-sm:inset-0 z-100 max-sm:h-screen max-sm:overflow-scroll bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-24 md:min-w-[300px]`}>
        <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2 text-gray-700'>
                    <Filter className='size-4'/>
                    <h3 className='font-semibold'>Filters</h3>
                </div>

                <div className='flex items-center gap-2'>
                    <X className='size-6 text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer'/>

                    <button onClick={()=>setShowFilterPhone(false)} className='sm:hidden text-sm border text-gray-700 px-3 py-1 rounded'>Apply</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default FilterSidebar