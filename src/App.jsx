import React, { Children, useEffect, useId, useState } from 'react'
import { useMotionValue, motion } from 'framer-motion'
import NavItem from './components/NavItem';
import { FaAws, FaGitAlt, FaGithub, FaJsSquare, FaNode, FaPython, FaReact } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { SiExpress, SiMongodb } from 'react-icons/si';
import { PiFileSqlLight } from 'react-icons/pi';
import { RiTailwindCssFill } from 'react-icons/ri';
import { GoArrowUpRight } from 'react-icons/go';
import ContactForm from './components/ContactForm';


const Highlight = ({ children }) => (
  <span className='text-white'>
    {children}
  </span>
)

const App = () => {
  const id = useId();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const Titles = [
    "About",
    "TechStack",
    "Projects",
    "Contact",
  ]
  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX - 300);
      mouseY.set(e.clientY - 300);
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div className='w-full bg-[#0F172A] text-white'>
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
          type: "spring",
          mass: 0.5,
          stiffness: 100,
          damping: 20
        }}
      />
      {/* content */}
      <div className='lg:px-[18%] md:px-[5%] h-screen flex flex-col justify-center md:justify-start md:flex-row '>

        {/* Hero side panel */}
        <div className='w-[50%] py-[10%] flex flex-col justify-between'>
          {/* title */}
          <div className='flex flex-col gap-3'>
            <span className='font-extrabold text-4xl opacity-75'>Roshan Muhammed R</span>
            <span className='text-md'>Full Stack Web Developer</span>
            <p className='font-light text-gray-400'>
              I build scalable, user-focused applications with clean <br />engineering and thoughtful design.
            </p>
          </div>

          {/* navigation */}
          <div className='flex flex-col '>
            {Titles.map((title, idx) => {
              return (
                <NavItem title={title} key={idx}/>
              )
            })}
          </div>

          {/* accounts */}
          <div className='flex gap-4 text-gray-400  '>
            <a href='https://github.com/RoshanMuhammedR' target='_blank' rel="noreferrer">
              <FaGithub className='size-7 hover:text-gray-300  transition-all' />
            </a>
            <a href='https://www.linkedin.com/in/roshan2004/' target='_blank' rel="noreferrer">
              <FaLinkedin className='size-7 hover:text-gray-300  transition-all' />
            </a>
          </div>
        </div>
        {/* right panel */}
        <div className=' w-[50%] flex flex-col gap-24 overflow-scroll no-scrollbar py-[10%] font-light text-lg text-slate-400 snap-y scroll-pt-22'>
          <section id="about">
            <div className='h-full flex flex-col gap-4 snap-start'>
              <p>
                I’m a <Highlight>full-stack developer</Highlight> who loves taking ideas and shaping them into <Highlight>real, working applications</Highlight>.
                There’s something genuinely satisfying about translating a rough concept into a <Highlight>clean interface</Highlight>,
                wiring it to a <Highlight>solid backend</Highlight>, and watching the whole thing come alive. I enjoy the balance between
                crafting <Highlight>intuitive user experiences</Highlight> and architecting the systems under the hood that make everything
                feel <Highlight>fast, dependable, and scalable</Highlight>.
              </p>
              <p>
                As a student with <Highlight>strong hands-on experience</Highlight>, most of my learning has come from building things,
                breaking them, and figuring out how to fix them better than before. That process — the trial, the
                debugging, the tiny improvements — is where I’ve learned the most about writing code that feels
                <Highlight> stable and intentional</Highlight> from the inside out.
              </p>
              <p>
                When I’m not deep in code, I’m usually <Highlight>watching movies, playing football</Highlight>, or taking a moment away
                from the screen to reset my mind. I like having that mix — intense, focused building paired with
                simple, everyday things that keep me grounded and curious.
              </p>
            </div>
          </section>
          {/* Tech stack */}
          <section id="techstack" className="snap-start">
            <div className="h-full flex flex-col gap-4 text-lg font-light text-slate-400 leading-relaxed">
              <p>
                These are the technologies I regularly work with — the tools that help me build
                <Highlight> clean interfaces</Highlight>, architect <Highlight>reliable backend systems</Highlight>, and bring
                <Highlight> full-stack applications</Highlight> together in a way that feels stable, intentional, and scalable.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-2">
                {[
                  { name: "React", icon: <FaReact />, color: "text-cyan-300" },
                  { name: "Node.js", icon: <FaNode />, color: "text-green-300" },
                  { name: "Express", icon: <SiExpress />, color: "text-slate-300" },
                  { name: "MongoDB", icon: <SiMongodb />, color: "text-emerald-300" },
                  { name: "SQL", icon: <PiFileSqlLight />, color: "text-blue-300" },
                  { name: "TailwindCSS", icon: <RiTailwindCssFill />, color: "text-cyan-300" },
                  { name: "JavaScript", icon: <FaJsSquare />, color: "text-yellow-300" },
                  { name: "Git", icon: <FaGitAlt />, color: "text-orange-300" },
                  { name: "AWS", icon: <FaAws />, color: "text-orange-200" },
                  { name: "Python", icon: <FaPython />, color: "text-blue-300" }
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="flex flex-col gap-1 opacity-80 hover:opacity-100 transition transform hover:scale-[1.02]"
                  >
                    <div className={`text-[26px] ${tech.color} opacity-90`}>
                      {tech.icon}
                    </div>
                    <span className="text-slate-200 text-[17px] tracking-wide">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
              <p className='text-md mt-2'>I’m always open to learning new
                technologies. If something helps me build better products or solve problems more effectively,
                I’m excited to dive in and pick it up quickly.
              </p>
            </div>
          </section>
          <section id="projects">
            <div className='group flex flex-col gap-5'>
              {/* Project 1 */}
              <div className='group/card p-4 rounded flex gap-5 text-base text-slate-200 font-medium leading-tight group-hover:opacity-40 hover:opacity-100 hover:bg-gray-50/10 transition-all'>
                {/* image */}
                <div className='min-w-[150px]'>
                  <img src='Project_1_1.png' width={200} height={48} className='border-2 border-slate-400 rounded' />
                </div>
                {/* content */}
                <div>
                  {/* title */}
                  <div className='flex gap-2 group-hover/card:text-cyan-400 transition-all'>
                    <h2 className=''>AI-powered travel planner I built</h2>
                    <GoArrowUpRight className='group-hover/card:animate-bounce' />
                  </div>
                  {/* desc */}
                  <p className='font-light text-sm mt-3 text-slate-400'>
                    I created an intelligent travel assistant that generates personalized, day-wise
                    itineraries with real destination images. It integrates Google Gemini for itinerary
                    generation, Google Places Image API for visuals, and Google OAuth 2.0 for secure authentication.
                    The platform also stores trip history and uses optimized prompting to deliver accurate and engaging
                    travel plans.
                  </p>
                  <div className='flex gap-5 mt-4'>
                    <a
                      href="https://ai-trip-planner-rho-orcin.vercel.app/"
                      target="_blank"
                      className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 hover:bg-teal-400/20 transition"
                    >
                      Website
                    </a>
                    <a
                      href="https://github.com/RoshanMuhammedR/AI_Trip_Planner"
                      target="_blank"
                      className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 hover:bg-teal-400/20 transition"
                    >
                      Source Code
                    </a>
                  </div>
                </div>
              </div>
              {/* project 2 */}
              <div className=' group/card p-4 rounded flex gap-5 text-base text-slate-200 font-medium leading-tight group-hover:opacity-40 hover:opacity-100 hover:bg-gray-50/10 transition-all'>
                {/* image */}
                <div className='min-w-[150px]'>
                  <motion.img
                    src='Project_2_1.png'
                    width={200} height={48}
                    className='border-2 border-slate-400 rounded'
                  />
                </div>
                {/* content */}
                <div>
                  {/* title */}
                  <div className='flex gap-2 group-hover/card:text-cyan-400 transition-all'>
                    <h2 className=''>Full-stack task manager I developed</h2>
                    <GoArrowUpRight className='group-hover/card:animate-bounce' />
                  </div>
                  {/* desc */}
                  <p className='font-light text-sm mt-3 text-slate-400'>
                    I built a secure, full-stack task manager using the MERN stack. It
                    features authentication with bcrypt, clean UI components styled with
                    Tailwind, and global state management through Zustand. The app supports
                    creating, updating, and tracking tasks with smooth interactions and
                    reliable backend storage for a consistent everyday workflow.
                  </p>
                  <div className='flex gap-5 mt-4'>
                    <a 
                      href="https://to-do-mern-y0qk.onrender.com/" 
                      target="_blank"
                      className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 hover:bg-teal-400/20 transition"
                    >
                      Website
                    </a>
                    <a 
                      href="https://github.com/RoshanMuhammedR/To-Do_MERN" 
                      target="_blank"
                      className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300 hover:bg-teal-400/20 transition"
                    >
                      Source Code
                    </a>
                  </div>
                </div>
              </div>
              
            </div>
          </section>
          <section id="contact" >
            <div className='h-screen w-full flex flex-col items-center'>
              <ContactForm/>
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}

export default App

