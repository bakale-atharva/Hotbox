"use client";

import { api } from "@backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/confirm-delete";
import { PageHeader } from "@/components/page-header";
import { PizzaImage } from "@/components/pizzas/pizza-image";
import { PizzaSheet, type AdminPizza } from "@/components/pizzas/pizza-sheet";
import { TableEmpty, TableSkeleton } from "@/components/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { errorMessage } from "@/lib/errors";
import { formatPrice } from "@/lib/format";

export default function PizzasPage() {
  const pizzas = useQuery(api.pizzas.adminList);
  const categories = useQuery(api.categories.list);
  const setAvailability = useMutation(api.pizzas.setAvailability);
  const remove = useMutation(api.pizzas.remove);
  const [editing, setEditing] = useState<AdminPizza | "new" | null>(null);

  const categoryName = (id: AdminPizza["categoryId"]) =>
    categories?.find((c) => c._id === id)?.name ?? "–";

  async function toggleAvailable(pizza: AdminPizza, isAvailable: boolean) {
    try {
      await setAvailability({ id: pizza._id, isAvailable });
      toast.success(`${pizza.name} is ${isAvailable ? "on" : "off"} the menu`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <>
      <PageHeader
        title="Pizzas"
        description="Your menu. Edits show up in the customer app instantly."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus data-icon="inline-start" /> New pizza
          </Button>
        }
      />
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Pizza</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">S</TableHead>
              <TableHead className="text-right">M</TableHead>
              <TableHead className="text-right">L</TableHead>
              <TableHead className="w-40">On menu</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pizzas === undefined ? (
              <TableSkeleton columns={7} />
            ) : pizzas.length === 0 ? (
              <TableEmpty columns={7}>
                No pizzas yet. Add your first one!
              </TableEmpty>
            ) : (
              pizzas.map((pizza) => {
                const missing = pizza.ingredients
                  .filter((i) => !i.inStock)
                  .map((i) => i.name);
                return (
                  <TableRow key={pizza._id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <PizzaImage
                          src={pizza.imageUrl}
                          alt={pizza.name}
                          className="size-12"
                        />
                        <div className="min-w-0">
                          <div className="font-medium">{pizza.name}</div>
                          <div className="max-w-80 truncate text-xs text-muted-foreground">
                            {pizza.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{categoryName(pizza.categoryId)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(pizza.prices.small)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(pizza.prices.medium)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(pizza.prices.large)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pizza.isAvailable}
                          onCheckedChange={(checked) =>
                            toggleAvailable(pizza, checked)
                          }
                          aria-label={`${pizza.name} on menu`}
                        />
                        {pizza.soldOut && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive" className="border-0">
                                Sold out
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Out of stock:{" "}
                              {missing.length
                                ? missing.join(", ")
                                : "a deleted ingredient"}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1 pr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${pizza.name}`}
                          onClick={() => setEditing(pizza)}
                        >
                          <Pencil />
                        </Button>
                        <ConfirmDelete
                          title={`Delete "${pizza.name}"?`}
                          description="It will disappear from the menu. Past orders keep their details."
                          successMessage="Pizza deleted"
                          onConfirm={() => remove({ id: pizza._id })}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <PizzaSheet
        key={
          editing === null ? "closed" : editing === "new" ? "new" : editing._id
        }
        pizza={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
