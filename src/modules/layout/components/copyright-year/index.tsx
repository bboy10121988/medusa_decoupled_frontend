"use client"

interface CopyrightYearProps {
  template: string
}

export default function CopyrightYear({ template }: CopyrightYearProps) {
  const currentYear = new Date().getFullYear()
  const copyright = template.replace(/{year}/g, currentYear.toString())
  
  return <span>{copyright}</span>
}