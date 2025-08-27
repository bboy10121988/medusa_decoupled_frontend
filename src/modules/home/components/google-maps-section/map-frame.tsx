import React from 'react'

interface MapFrameProps {
  width?: string | number
  height?: string | number
}

const MapFrame: React.FC<MapFrameProps> = ({
  width = "100%",
  height = 450
}) => {
  return (
    <div style={{ width, height }}>
      <iframe
        src="https://timsfantasy.com/maps"
        style={{
          border: "none",
          width: "100%",
          height: "100%"
        }}
        scrolling="no"
      />
    </div>
  )
}

export default MapFrame
