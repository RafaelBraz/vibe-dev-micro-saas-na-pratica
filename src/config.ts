export const config = {
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_KEY,
    plans: {
      free: {
        stripePriceId: "price_1P4PfjFNncBP1QfFdGtN87eL",
        quota: {
          TASKS: 5,
        },
      },
      pro: {
        stripePriceId: "price_1P4Pg3FNncBP1QfFmvFsqyN3",
        quota: {
          TASKS: 100,
        },
      },
    },
  },
};
