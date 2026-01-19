import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"
import { accountTranslations } from "@/lib/translations"

const SignInPrompt = () => {
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "tw"
  const t = accountTranslations[countryCode as keyof typeof accountTranslations] || accountTranslations.tw

  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          {t.alreadyAMember}
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          {t.loginDescription}
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10" data-testid="sign-in-button">
            {t.signIn}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
