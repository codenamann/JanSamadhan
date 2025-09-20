import React from "react"
import { cn } from "@/lib/utils"
import logo from "../../assets/JanSamadhan.png"

const Logo = ({ link, alt = "Logo", className }) => {
  return <img src={link} alt={alt} className={cn("w-32 h-auto", className)} />
}

export default Logo
