import { useRef, useState } from "react";
import { MapPin } from "lucide-react";
import Logo from "@/components/ui/logo";
import LogoImage from "../assets/JanSamadhan.png";
import MapImage from "../assets/World_map_-_low_resolution.svg"
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function JanSamadhanUI() {
  const tailwindText = "bg-gradient-to-r from-[#b77c25] to-[#cd9a3f] bg-clip-text text-transparent";
  const navigate = useNavigate();
  const SignupRef =  useRef(null);

  return (
    <div className="bg-background min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto rounded-2xl shadow-lg p-6 md:p-10">
        {/* Navbar */}
        <div className="flex justify-between items-center gap-4 mb-14 md:mb-28">
          <Logo link={LogoImage} alt="Jan Samadhan Logo" />
          <div className="flex items-center gap-2 sm:w-auto">
            <Button size='sm' onClick={() => SignupRef.current?.scrollIntoView()}>
              Signup
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 md: gap-8 items-center mb-32 md:mb-40">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1e2d4b]">
              J<span className={tailwindText}>an</span>Samadhan
            </h2>
            <p className="text-muted-foreground mb-6 text-sm md:text-base">
                JanSamadhan makes civic problem-solving easy and transparent. <br />
                Report issues to authorities, track progress, and ensure quick resolution.
            </p>
            <Button size='lg' onClick={()=>navigate('/citizen/login')}>
              Report Issue
            </Button>
          </div>
          <div className="relative order-1 md:order-2 w-full h-64 md:h-80 bg-secondary border rounded-lg flex justify-center items-center">
            <img
              src= {MapImage}
              alt="Map"
              className="w-full h-full object-contain opacity-70"
            />
            <MapPin className="absolute top-1/3 left-1/3 text-orange-600 w-8 h-8" />
            <MapPin className="absolute top-1/2 left-1/2 text-red-600 w-8 h-8" />
          </div>
        </div>

        {/* What is JanSamadhan */}
        <section className="mb-12 px-4 md:px-0">
          <h3 className="text-2xl font-bold mb-4 text-center md:text-left text-[#1e2d4b]">What is JanSamadhan?</h3>
          <p className="text-gray-700 text-sm md:text-base text-center md:text-left">
            JanSamadhan is a platform that allows citizens to report civic issues directly to the authorities. 
            It simplifies the process, ensures transparency, and allows everyone to track the status of their complaints.
          </p>
        </section>

        {/* How it Works */}
        <section className="mb-12 px-4 md:px-0">
          <h3 className="text-2xl font-bold mb-6 text-center md:text-left text-[#1e2d4b]">How it Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-secondary rounded-lg shadow">
              <h4 className="font-semibold text-secondary-foreground mb-2">1. Report</h4>
              <p className="text-muted-foreground text-sm">Citizens report issues via app or web.</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg shadow">
              <h4 className="font-semibold mb-2">2. Verification</h4>
              <p className="text-muted-foreground text-sm">Authorities verify the reported issue quickly.</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg shadow">
              <h4 className="font-semibold mb-2">3. Resolution</h4>
              <p className="text-muted-foreground text-sm">Issue is resolved and status is updated on the platform.</p>
            </div>
          </div>
        </section>

        {/* Why Use It */}
        <section className="mb-12 md:mb-20 px-4 md:px-0">
          <h3 className="text-2xl font-bold mb-4 text-center md:text-left text-[#1e2d4b]">Why Use JanSamadhan?</h3>
          <ul className="list-disc list-inside text-gray-700 text-sm md:text-base space-y-2">
            <li>Easy and fast issue reporting.</li>
            <li>Transparency with real-time updates.</li>
            <li>Helps authorities respond efficiently.</li>
            <li>Track and measure civic improvements.</li>
          </ul>
        </section>

        {/* Get Started */}
        <section ref={SignupRef} className="mb-12 px-4 md:px-0 text-center">
          <h3 className="text-2xl font-bold mb-4 text-[#1e2d4b]">Get Started</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="size-lg" onClick={()=>navigate('/citizen/login')}>
              Citizen Login
            </Button>
            <Button variant='secondary' className='size-lg'
            >
              Authority Login
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-gray-600 text-xs text-center md:text-left border-t border-gray-300 pt-4">
          © 2025 JanSamadhan. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
