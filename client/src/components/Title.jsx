import React from 'react'

const Title = ({title,description}) => {
  return (
    <div className='flex flex-col items-center mb-8 text-center px-4'>
        <h3 className='text-2xl font-bold text-gray-800'>{title}</h3>
        <p className='text-slate-600 text-md max-w-md mx-auto'>{description}</p>

       
    </div>
  )
}

export default Title