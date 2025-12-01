import React, { useEffect, useState } from 'react'
import { useMotionValue,motion } from 'framer-motion'
import NavItem from './components/NavItem';
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";


const App = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const Titles = [
    "About",
    "Skills",
    "TechStack",
    "Projects",
    "Education",
    "Contact",
  ]
  useEffect(()=>{
    const move = (e)=>{
      mouseX.set(e.clientX - 300);
      mouseY.set(e.clientY - 300);
    }
    window.addEventListener("mousemove",move);
    return ()=>window.removeEventListener("mousemove",move);
  },[]);
  return (
    <div className='w-full h-screen bg-[#0F172A] text-white'>
      <motion.div
        style={{
          x: mouseX,
          y: mouseY
        }}
         className="pointer-events-none
            fixed top-0 left-0
            w-[600px] h-[600px]
            rounded-full
            opacity-15
            blur-[180px]
            bg-cyan-300
            mix-blend-screen"
          transition={{
            type:"spring",
            mass:0.5,
            stiffness:100,
            damping:20
          }}
      />
      {/* content */}
      <div className='px-[18%] h-screen flex'> 
          {/* Hero side panel */}
          <div className='w-[50%] py-[10%] flex flex-col justify-between'>
            {/* title */}
            <div className='flex flex-col gap-3'>
              <span className='font-extrabold text-4xl opacity-75'>Roshan Muhammed R</span>
              <span className='text-md'>Full Stack Web Developer</span>
              <p className='font-light text-gray-400'>I build scalable, user-focused applications with clean engineering and thoughtful design.</p>
            </div>

            {/* navigation */}
            <div className='flex flex-col'>
              {Titles.map((title,idx)=>{
                return (
                  <NavItem title={title}/>
                )
              })}
            </div>

            {/* accounts */}
            <div className='flex gap-4 text-gray-400  '>
              <a href='https://github.com/RoshanMuhammedR' target='_blank'>
                <FaGithub className='size-7 hover:text-gray-300  transition-all'/>
              </a>
              <a href='https://www.linkedin.com/in/roshan2004/' target='_blank'>
                <FaLinkedin className='size-7 hover:text-gray-300  transition-all' />
              </a>
            </div>

          </div>

          <div className=' w-[50%] flex flex-col gap-5 overflow-scroll no-scrollbar py-[10%]'>
            <section id="about" className='bg-yellow-300'>
              <div className='h-[350px]'>
                Hello
              </div>
            </section>
            <section id="skills" className='bg-yellow-300'>
              <div className='h-[350px]'>
                Hello
              </div>
            </section>
            <section id="techstack" className='bg-yellow-300'>
              <div className='h-[350px]'>
                Hello
              </div>
            </section>
            <section id="projects" className='bg-yellow-300'>
              <div className='h-[350px]'>
                Hello
              </div>
            </section>
            <section id="education" className='bg-yellow-300'>
              <div className='h-[350px]'>
                Hello
              </div>
            </section>
            <section id="contact" className='bg-yellow-300'>
              <div className='h-[350px]'>
                Hello
              </div>
            </section>
          </div>
          
      </div>
    </div>
  )
}

export default App