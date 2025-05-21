import React from 'react'
import { Link } from 'react-router-dom'

const CTAButton = ({children,active,linkto}) => {
  return (
    <Link to={linkto}>
    <div className={`text-center text-[13px] px-6 py-3 font-bold rounded-md ${active?"bg-yellow-400 text-black" : "bg-[#161d29] text-[#2c333f]"}`}>
      {children}
    </div>
    </Link>
    
  )
}

export default CTAButton