import { Metadata } from "next"
import { notFound } from "next/navigation"
import OrderDetails from "@modules/account/components/order-details"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `訂單詳情 - ${id}`,
    description: "查看您的訂單詳細資訊",
  }
}

export default async function OrderDetailsPage({ params }: Props) {
  const { countryCode, id } = await params

  if (!id) {
    notFound()
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">訂單詳情</h1>
        <p className="text-base-regular">
          查看您的訂單詳細資訊和配送狀態
        </p>
      </div>
      <OrderDetails orderId={id} countryCode={countryCode} />
    </div>
  )
}