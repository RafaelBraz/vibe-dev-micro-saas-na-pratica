"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProfileSchema } from "../schema";
import { updateProfile } from "../actions";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProfileFormProps = {
  defaultValue: Session["user"];
};

export function ProfileForm({ defaultValue }: ProfileFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: defaultValue?.name ?? "",
      email: defaultValue?.email ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await updateProfile(data);
    router.refresh();

    toast({
      title: "Success",
      description: "Profile updated successfully.",
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={"space-y-8"}>
        <Card>
          <CardHeader>
            <CardTitle>Nome</CardTitle>
            <CardDescription>
              Este é o seu nome exibido publicamente.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              name={"name"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>

                  <FormControl>
                    <Input placeholder={"Digite seu nome"} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-mail</CardTitle>
            <CardDescription>Este é o seu e-mail público.</CardDescription>
          </CardHeader>

          <CardContent>
            <FormField
              control={form.control}
              name={"email"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>

                  <FormControl>
                    <Input
                      placeholder={"Digite seu e-mail"}
                      readOnly
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Por favor, envie um e-mail para contact@microsaas.com.br se
                    deseja alterar seu e-mail.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter></CardFooter>
        </Card>

        <SheetFooter className={"mt-auto"}>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Atualizando..." : "Atualizar"}
          </Button>
        </SheetFooter>
      </form>
    </Form>
  );
}
