import Stripe from "stripe";

import { config } from "@/config";
import { prisma } from "../database";

export const stripe = new Stripe(config.stripe.secretKey ?? "", {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({ email });
  return customers.data[0];
};

export const createStripeCustomer = async (input: {
  name?: string;
  email: string;
}) => {
  let customer = await getStripeCustomerByEmail(input.email);
  if (customer) return customer;

  const createdCustomer = await stripe.customers.create({
    email: input.email,
    name: input.name,
  });

  const createdCostumerSubscription = await stripe.subscriptions.create({
    customer: createdCustomer.id,
    items: [{ price: config.stripe.plans.free.stripePriceId }],
  });

  await prisma.user.update({
    where: {
      email: input.email,
    },
    data: {
      stripeCustomerId: createdCustomer.id,
      stripeSubscriptionId: createdCostumerSubscription.id,
      stripeSubscriptionStatus: createdCostumerSubscription.status,
      stripePriceId: config.stripe.plans.free.stripePriceId,
    },
  });

  return createdCustomer;
};

export const createCheckoutSession = async (
  userId: string,
  userEmail: string,
  userStripeSubscriptionId: string
) => {
  try {
    const customer = await createStripeCustomer({
      email: userEmail,
    });

    const subscription = await stripe.subscriptionItems.list({
      subscription: userStripeSubscriptionId,
      limit: 1,
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: "http://localhost:3000/app/settings/billing",
      flow_data: {
        type: "subscription_update_confirm",
        after_completion: {
          type: "redirect",
          redirect: {
            return_url:
              "http://localhost:3000/app/settings/billing?success=true",
          },
        },
        subscription_update_confirm: {
          subscription: userStripeSubscriptionId,
          items: [
            {
              id: subscription.data[0].id,
              price: config.stripe.plans.pro.stripePriceId,
              quantity: 1,
            },
          ],
        },
      },
    });

    return {
      url: session.url,
    };
  } catch (error) {
    throw new Error("Error to create checkout session");
  }
};

export const handleProcessWebhookUpdatedSubscription = async (event: {
  object: Stripe.Subscription;
}) => {
  const stripeCustomerId = event.object.customer as string;
  const stripeSubscriptionId = event.object.id as string;
  const stripeSubscriptionStatus = event.object.status;
  const stripePriceId = event.object.items.data[0].price.id;

  const userExists = await prisma.user.findFirst({
    where: {
      OR: [
        {
          stripeSubscriptionId,
        },
        {
          stripeCustomerId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  if (!userExists) {
    throw new Error("user of stripeCustomerId not found");
  }

  await prisma.user.update({
    where: {
      id: userExists.id,
    },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
      stripeSubscriptionStatus,
      stripePriceId,
    },
  });
};

export const getPlanByPrice = (priceId: string) => {
  const { plans } = config.stripe;
  const planKey = Object.keys(plans).find(
    (key) => plans[key as keyof typeof plans].stripePriceId === priceId
  );

  const plan = planKey ? plans[planKey as keyof typeof plans] : null;

  if (!plan) {
    throw new Error(`Plan not found for priceId: ${priceId}`);
  }

  return {
    name: planKey,
    quote: {
      TASKS: plan.quota.TASKS,
    },
  };
};

export const getUserCurrentUsage = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user || !user.stripePriceId) {
    throw new Error("User or user.stripeProductId not found.");
  }

  const plan = getPlanByPrice(user.stripePriceId);

  const tasksCount = await prisma.todo.count({
    where: {
      userId,
    },
  });

  return {
    plan,
    quota: {
      TASKS: {
        available: plan.quote.TASKS,
        current: tasksCount,
        usage: (tasksCount / plan.quote.TASKS) * 100,
      },
    },
  };
};
