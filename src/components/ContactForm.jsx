import React, { useState, useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";

export default function ContactForm() {
  const [data, setData] = useState({
    company: "",
    name: "",
    email: "",
    message: ""
  })
  const [load,setLoad] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoad(true);
    try {
      const res = await fetch("http://localhost:8080/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed");
      toast.success("Mail Sent");
    } catch (error) {
      toast.error("Mail Failed to Send")
    } finally{
      setLoad(false);
    }

    
  };

  return (
    <>
      <h1 className="text-6xl font-extrabold text-slate-200 flex gap-3 group" >
        <span className="relative text-white">
          Let's
        </span>
        <span className="text-cyan-300">
          talk
        </span>
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-[85%] mt-10">

        {/* Honeypot field */}
        <input
          name="company"
          autoComplete="off"
          tabIndex="-1"
          style={{ display: "none" }}
          onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
        />

        <input
          name="name"
          required
          placeholder="Your name"
          className="p-3 rounded bg-[#0F172A] border border-gray-600 focus:outline-none"
          onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
        />

        <input
          name="email"
          type="email"
          required
          placeholder="Your email"
          className="p-3 rounded bg-[#0F172A] border border-gray-600 focus:outline-none"
          onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
        />

        <textarea
          name="message"
          required
          placeholder="Your message"
          rows={7}
          className="p-3 rounded bg-[#0F172A] border border-gray-600 focus:outline-none resize-none"
          onChange={(e) => setData({ ...data, [e.target.name]: e.target.value })}
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded flex justify-center items-center" disabled={load}>
          {load && <AiOutlineLoading3Quarters className="animate-spin size-5 mr-2 "/>}
          Send
        </button>
      </form>
    </>
  );
}
