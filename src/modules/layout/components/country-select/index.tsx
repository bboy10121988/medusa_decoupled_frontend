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

import { StateType } from "@lib/hooks/use-toggle-state"
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
    if (countryCode) {
      const option = options?.find((o) => o?.country === countryCode)
      setCurrent(option)
    }
  }, [options, countryCode])

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
  }

  return (
    <div className="w-[60px]">
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
              <div className="txt-compact-small flex justify-center items-center">
                {current && (
                  <>
                    <span className="flex items-center justify-center">
                      {/* @ts-ignore */}
                      <ReactCountryFlag
                        svg
                        style={{
                          width: "16px",
                          height: "16px",
                        }}
                        countryCode={current.country ?? ""}
                      />
                    </span>
                  </>
                )}
              </div>
            </ListboxButton>
            <div className="flex relative w-[60px] justify-end">
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListboxOptions
                  className="absolute top-full right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-small-regular uppercase text-black no-scrollbar rounded-rounded w-[60px]"
                  static
                >
                  {options?.map((o, index) => {
                    return (
                      <ListboxOption
                        key={index}
                        value={o}
                        onClick={() => { if (o) handleChange(o as CountryOption) }}
                        className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center justify-center w-full"
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
