import { Badge } from "@medusajs/ui"

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge color="orange" className={className}>
      <span className="font-semibold">注意：</span> 僅供測試用途。
    </Badge>
  )
}

export default PaymentTest
