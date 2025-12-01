import React, { useState } from 'react'
import {motion} from 'framer-motion'


const NavItem = ({title}) => {
    const [hover,setHover] = useState(false);
    return (
        <div className='flex items-center h-10 gap-2 group'
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <motion.div
                className='border-t h-5 self-end border-gray-400'
                animate={{
                    width: hover ? 80 : 60
                }}
                transition={{
                    type: "spring",
                    duration: 0.25
                }}
            />
            <a
                href={`#${title.toLowerCase()}`} 
                className='hover:opacity-100 opacity-80 transition font-bold text-sm'
            >
                {title.toUpperCase()}
            </a>
        </div>
    )
}

export default NavItem