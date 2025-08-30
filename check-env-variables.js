const c = require("ansi-colors")

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    // TODO: we need a good doc to point this to
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
]

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    )

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`))
      }
    })

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    )

    process.exit(1)
  }

  // 非阻斷：提示 Stripe 公開金鑰（若你啟用 Stripe 支付）
  if (!process.env.NEXT_PUBLIC_STRIPE_KEY) {
    console.warn(
      c.yellow(
        "\n⚠️  Warning: NEXT_PUBLIC_STRIPE_KEY is not set. If Stripe payments are enabled, set it in your .env."
      )
    )
  }

  // 非阻斷：提示後端 URL（middleware 需要 MEDUSA_BACKEND_URL）
  if (!process.env.MEDUSA_BACKEND_URL) {
    console.warn(
      c.yellow(
        "\n⚠️  Warning: MEDUSA_BACKEND_URL is not set. Middleware relies on it to resolve regions."
      )
    )
  }

  // 非阻斷：提示 Sanity 與站台 URL
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
    console.warn(
      c.yellow(
        "\n⚠️  Warning: Sanity envs missing (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET). Studio/content fetching may misbehave."
      )
    )
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn(
      c.yellow(
        "\n⚠️  Warning: NEXT_PUBLIC_SITE_URL is not set. SEO canonical/metadataBase will fallback to http://localhost:8000."
      )
    )
  }
}

module.exports = checkEnvVariables
