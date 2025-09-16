'use client'

import React from "react"

interface GoogleMapsSectionProps {
  heading?: string
  description?: string
}

const GoogleMapsSection: React.FC<GoogleMapsSectionProps> = ({
  heading = "店家位置",
  description = "歡迎蒞臨參觀",
}) => {
  return (
    <div className={heading ? "bg-white py-8 md:py-12" : "bg-white py-0"}>
      <div className="container mx-auto px-4">
        {heading && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
            {description && (
              <p className="mt-4 text-lg text-gray-600">{description}</p>
            )}
          </div>
        )}
        <div className="relative w-full h-[450px] md:h-[450px] bg-gray-50 rounded-xl overflow-hidden shadow-lg transition-transform hover:shadow-xl">
          <iframe 
            className="absolute inset-0 w-full h-full border-0" 
            src="https://www.google.com/maps/place/Tim%E2%80%99s+fantasy+World+%E7%94%B7%E5%A3%AB%E7%90%86%E9%AB%AE%E5%BB%B3/@25.030775,121.5245831,17z/data=!3m1!4b1!4m6!3m5!1s0x3442a9446e13fa69:0x3e9b9e89bc90f145!8m2!3d25.030775!4d121.527158!16s%2Fg%2F11by_p_3fh?entry=ttu&g_ep=EgoyMDI1MDYwNC4wIKXMDSoASAFQAw%3D%3D"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Tim's fantasy World 男士理髮廳位置"
          />
        </div>
      </div>
    </div>
  )
}

export default GoogleMapsSection
