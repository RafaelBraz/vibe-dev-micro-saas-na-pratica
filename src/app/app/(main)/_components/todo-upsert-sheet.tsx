"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PropsWithChildren, useRef } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Todo } from "../types";
import { upsertTodo } from "../actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { upsertTodoSchema } from "../schema";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

type TodoUpsertSheet = PropsWithChildren & {
  defaultValue?: Todo;
};

export function TodoUpsertSheet({ defaultValue, children }: TodoUpsertSheet) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const form = useForm({
    resolver: zodResolver(upsertTodoSchema),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await upsertTodo(data);
    router.refresh();
    ref.current?.click();

    toast({
      title: "Success",
      description: "Task updated successfully.",
    });
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div ref={ref}>{children}</div>
      </SheetTrigger>

      <SheetContent className="space-y-8 h-screen">
        <Form {...form}>
          <form onSubmit={onSubmit} className={"space-y-8 h-screen"}>
            <SheetHeader>
              <SheetTitle>Upsert todo</SheetTitle>

              <SheetDescription>
                Add or edit your todo item here. Click save when you are done.
              </SheetDescription>
            </SheetHeader>

            <FormField
              control={form.control}
              name={"title"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>

                  <FormControl>
                    <Input placeholder="Enter your todo title" {...field} />
                  </FormControl>

                  <FormDescription>
                    This is your displayed name for the task.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className={"mt-4"}>
              <Button type="submit">Save changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
