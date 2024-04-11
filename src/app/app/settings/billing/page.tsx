import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createCheckoutSessionAction } from "./actions";
import { auth } from "@/services/auth";
import { getUserCurrentUsage } from "@/services/stripe";
import { Progress } from "@/components/ui/progress";

export default async function Page() {
  const session = await auth();
  const { plan, quota } = await getUserCurrentUsage(session?.user?.id as string);

  return (
    <form action={createCheckoutSessionAction}>
      <Card>
        <CardHeader className={"border-b border-border"}>
          <CardTitle>Uso do Plano</CardTitle>
          <CardDescription>
            Você está atualmente no plano{" "}
            <span className={"font-bold uppercase"}>{plan.name}</span>.
          </CardDescription>
        </CardHeader>

        <CardContent className={"pt-6"}>
          <div className={"space-y-2"}>
            <header className={"flex items-center justify-between"}>
              <span className={"text-muted-foreground text-sm"}>
                {quota.TASKS.current}/{quota.TASKS.available}
              </span>
              <span className={"text-muted-foreground text-sm"}>
                {Math.round(quota.TASKS.usage)}%
              </span>
            </header>

            <section>
              <Progress value={Math.round(quota.TASKS.usage)} />
            </section>
          </div>
        </CardContent>

        <CardFooter
          className={
            "pt-6 flex items-center justify-between border-t border-border"
          }
        >
          <span>Quer mais limite? Assine o plano PRO</span>
          <Button type={"submit"}>Assine por R$9/mês</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
