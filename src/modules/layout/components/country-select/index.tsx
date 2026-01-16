"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"

import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  regions: HttpTypes.StoreRegion[]
}

const CountrySelect = ({ regions }: CountrySelectProps) => {
  const [current, setCurrent] = useState<
    | { country: string | undefined; region: string; label: string | undefined }
    | undefined
  >(undefined)
  const [isMounted, setIsMounted] = useState(false)

  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1]

  const options = useMemo(() => {
    return regions
      ?.map((r) => {
        return r.countries?.map((c) => ({
          country: c.iso_2,
          region: r.id,
          label: c.display_name,
        }))
      })
      .flat()
      .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))
  }, [regions])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (countryCode) {
      const option = options?.find((o) => o?.country === countryCode)
      setCurrent(option)
    }
  }, [options, countryCode])

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
  }

  // 防止 hydration 不匹配，只在客戶端渲染
  if (!isMounted) {
    return (
      <div className="w-[80px]">
        <div className="py-1 w-full">
          <div className="txt-compact-small flex justify-center items-center gap-2">
            {current && (
              <span className="flex items-center justify-center gap-2">
                <ReactCountryFlag
                  svg
                  style={{
                    width: "16px",
                    height: "16px",
                  }}
                  countryCode={current.country ?? ""}
                />
                <span className="uppercase text-xs font-medium">{current.country}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[80px]">
      <Listbox
        as="div"
        defaultValue={
          countryCode
            ? options?.find((o) => o?.country === countryCode)
            : undefined
        }
      >
        {({ open }) => (
          <>
            <ListboxButton className="py-1 w-full">
              <div className="txt-compact-small flex justify-center items-center gap-2">
                {current && (
                  <>
                    <span className="flex items-center justify-center gap-2">
                      {/* @ts-ignore */}
                      <ReactCountryFlag
                        svg
                        style={{
                          width: "16px",
                          height: "16px",
                        }}
                        countryCode={current.country ?? ""}
                      />
                      <span className="uppercase text-xs font-medium">{current.country}</span>
                    </span>
                  </>
                )}
              </div>
            </ListboxButton>
            <div className="flex relative w-[80px] justify-end">
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions
                  className="absolute top-full right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-small-regular uppercase text-black no-scrollbar rounded-rounded w-[80px]"
                  static
                >
                  {options?.map((o, index) => {
                    return (
                      <ListboxOption
                        key={index}
                        value={o}
                        onClick={() => { if (o) handleChange(o as CountryOption) }}
                        className="py-2 hover:bg-gray-100 px-3 cursor-pointer flex items-center justify-center gap-2 w-full"
                      >
                        {/* @ts-ignore */}
                        <ReactCountryFlag
                          svg
                          style={{
                            width: "16px",
                            height: "16px",
                          }}
                          countryCode={o?.country ?? ""}
                        />
                        <span className="uppercase text-xs font-medium">{o?.country}</span>
                      </ListboxOption>
                    )
                  })}
                </ListboxOptions>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}
export default CountrySelect
