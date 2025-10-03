"use client"

import React, { useEffect, useActionState, useState } from "react";

import Input from "@modules/common/components/input"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { getDisplayEmail } from "@lib/utils/google-email-utils"
// import { updateCustomer } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)
  const [displayEmail, setDisplayEmail] = useState<string>(customer.email)

  // 獲取顯示用的email（優先使用真實Google email）
  useEffect(() => {
    const realEmail = getDisplayEmail(customer.email)
    setDisplayEmail(realEmail)
  }, [customer.email])

  // Email 更新功能暫時禁用（基於安全考量）
  const updateCustomerEmail = (
    _currentState: { success: boolean; error: string },
    _formData: FormData
  ) => {
    // Email 更新功能暫時不可用
    return { success: false, error: "Email 更新功能暫時不可用" }
  }

  const [state, formAction] = useActionState(updateCustomerEmail, {
    error: "",
    success: false,
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
        label="電子郵件"
        currentInfo={displayEmail}
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={clearState}
        data-testid="account-email-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="電子郵件"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={displayEmail}
            data-testid="email-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileEmail
