import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@components/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          已經有帳戶了嗎？
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          登入以獲得更好的購物體驗。
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10" data-testid="sign-in-button">
            登入
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
