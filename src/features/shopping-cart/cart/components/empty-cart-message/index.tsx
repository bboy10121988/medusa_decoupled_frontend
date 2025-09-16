import { Heading, Text } from "@medusajs/ui"

import InteractiveLink from "@shared/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        購物車
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        您的購物車目前是空的。讓我們開始購物吧！使用下方連結開始瀏覽我們的商品。
      </Text>
      <div>
        <InteractiveLink href="/store">瀏覽商品</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
