"use client"

import React, { useEffect, useActionState } from "react";

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomerPhone } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfilePhone: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const [state, formAction] = useActionState(updateCustomerPhone, {
    success: false,
    error: null,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="電話"
        currentInfo={`${customer.phone || "未設定"}`}
        isSuccess={successState}
        isError={!!state.error}
        clearState={clearState}
        data-testid="account-phone-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="電話"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={customer.phone ?? ""}
            data-testid="phone-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePhone

