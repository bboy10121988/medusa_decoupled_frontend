import React from "react"

const Bank = ({ ...props }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2 20h20v2H2v-2zm0-2h20v-2H2v2zm10-16L2 6v2h20V6l-10-4zm-3 8h2v6H9v-6zm4 0h2v6h-2v-6z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Bank
