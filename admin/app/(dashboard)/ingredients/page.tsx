"use client";

import { api } from "@backend/convex/_generated/api";
import type { Doc } from "@backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/confirm-delete";
import { PageHeader } from "@/components/page-header";
import { TableEmpty, TableSkeleton } from "@/components/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorMessage } from "@/lib/errors";

type Ingredient = Doc<"ingredients">;

export default function IngredientsPage() {
  const ingredients = useQuery(api.ingredients.list);
  const pizzas = useQuery(api.pizzas.adminList);
  const update = useMutation(api.ingredients.update);
  const remove = useMutation(api.ingredients.remove);
  const [editing, setEditing] = useState<Ingredient | "new" | null>(null);
  const [search, setSearch] = useState("");

  const usedBy = (id: Ingredient["_id"]) =>
    pizzas?.filter((p) => p.ingredientIds.includes(id));
  const filtered = ingredients?.filter((i) =>
    i.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const outOfStock = ingredients?.filter((i) => !i.inStock).length ?? 0;

  async function toggleStock(ingredient: Ingredient, inStock: boolean) {
    try {
      await update({ id: ingredient._id, inStock });
      const affected = usedBy(ingredient._id)?.length ?? 0;
      toast.success(
        `${ingredient.name} is ${inStock ? "back in stock" : "out of stock"}`,
        {
          description:
            affected > 0
              ? `${affected} pizza${affected === 1 ? "" : "s"} ${inStock ? "may be available again" : "now show as sold out"}.`
              : undefined,
        },
      );
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <>
      <PageHeader
        title="Ingredients"
        description={
          outOfStock > 0
            ? `${outOfStock} out of stock. Pizzas using them show as sold out.`
            : "Everything is in stock."
        }
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus data-icon="inline-start" /> New ingredient
          </Button>
        }
      />
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ingredients…"
          className="pl-9"
        />
      </div>
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>Used in</TableHead>
              <TableHead className="w-40">In stock</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered === undefined ? (
              <TableSkeleton columns={4} rows={6} />
            ) : filtered.length === 0 ? (
              <TableEmpty columns={4}>
                {search
                  ? "No ingredients match your search."
                  : "No ingredients yet."}
              </TableEmpty>
            ) : (
              filtered.map((ingredient) => {
                const users = usedBy(ingredient._id);
                return (
                  <TableRow key={ingredient._id}>
                    <TableCell className="pl-4 font-medium">
                      {ingredient.name}
                    </TableCell>
                    <TableCell className="max-w-72 truncate text-muted-foreground">
                      {users === undefined
                        ? "–"
                        : users.length === 0
                          ? "Not used"
                          : users.map((p) => p.name).join(", ")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={ingredient.inStock}
                          onCheckedChange={(checked) =>
                            toggleStock(ingredient, checked)
                          }
                          aria-label={`${ingredient.name} in stock`}
                        />
                        {!ingredient.inStock && (
                          <Badge variant="destructive" className="border-0">
                            Out
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1 pr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Rename ${ingredient.name}`}
                          onClick={() => setEditing(ingredient)}
                        >
                          <Pencil />
                        </Button>
                        <ConfirmDelete
                          title={`Delete "${ingredient.name}"?`}
                          description="Ingredients that are still used by a pizza can't be deleted."
                          successMessage="Ingredient deleted"
                          onConfirm={() => remove({ id: ingredient._id })}
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

      <IngredientDialog
        key={
          editing === null ? "closed" : editing === "new" ? "new" : editing._id
        }
        ingredient={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

function IngredientDialog({
  ingredient,
  onClose,
}: {
  ingredient: Ingredient | "new" | null;
  onClose: () => void;
}) {
  const create = useMutation(api.ingredients.create);
  const update = useMutation(api.ingredients.update);
  const existing = ingredient && ingredient !== "new" ? ingredient : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [inStock, setInStock] = useState(existing?.inStock ?? true);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (existing) {
        await update({ id: existing._id, name, inStock });
        toast.success("Ingredient updated");
      } else {
        await create({ name, inStock });
        toast.success("Ingredient created");
      }
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={ingredient !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {existing ? "Edit ingredient" : "New ingredient"}
            </DialogTitle>
            <DialogDescription>
              Pizzas become sold out when any of their ingredients is out of
              stock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="ingredient-name">Name</Label>
            <Input
              id="ingredient-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mozzarella"
              required
              autoFocus
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="ingredient-stock">In stock</Label>
            <Switch
              id="ingredient-stock"
              checked={inStock}
              onCheckedChange={setInStock}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {existing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
