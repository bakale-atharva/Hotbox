"use client";

import { api } from "@backend/convex/_generated/api";
import type { Doc } from "@backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/confirm-delete";
import { PageHeader } from "@/components/page-header";
import { TableEmpty, TableSkeleton } from "@/components/table-skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { errorMessage } from "@/lib/errors";

type Category = Doc<"categories">;

export default function CategoriesPage() {
  const categories = useQuery(api.categories.list);
  const pizzas = useQuery(api.pizzas.adminList);
  const remove = useMutation(api.categories.remove);
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  const pizzaCount = (id: Category["_id"]) =>
    pizzas?.filter((p) => p.categoryId === id).length;
  const nextSortOrder = categories?.length
    ? Math.max(...categories.map((c) => c.sortOrder)) + 1
    : 1;

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group pizzas on the menu. Position 1 shows first."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus data-icon="inline-start" /> New category
          </Button>
        }
      />
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 pl-4">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Pizzas</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories === undefined ? (
              <TableSkeleton columns={4} />
            ) : categories.length === 0 ? (
              <TableEmpty columns={4}>No categories yet.</TableEmpty>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="pl-4 tabular-nums text-muted-foreground">
                    {category.sortOrder}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="tabular-nums">
                    {pizzaCount(category._id) ?? "–"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1 pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${category.name}`}
                        onClick={() => setEditing(category)}
                      >
                        <Pencil />
                      </Button>
                      <ConfirmDelete
                        title={`Delete "${category.name}"?`}
                        description="Categories that still have pizzas can't be deleted."
                        successMessage="Category deleted"
                        onConfirm={() => remove({ id: category._id })}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CategoryDialog
        key={
          editing === null ? "closed" : editing === "new" ? "new" : editing._id
        }
        category={editing}
        defaultSortOrder={nextSortOrder}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

function CategoryDialog({
  category,
  defaultSortOrder,
  onClose,
}: {
  category: Category | "new" | null;
  defaultSortOrder: number;
  onClose: () => void;
}) {
  const create = useMutation(api.categories.create);
  const update = useMutation(api.categories.update);
  const existing = category && category !== "new" ? category : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [sortOrder, setSortOrder] = useState(
    String(existing?.sortOrder ?? defaultSortOrder),
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const order = Number(sortOrder);
    if (!Number.isInteger(order) || order < 1) {
      toast.error("Sort order must be a whole number starting at 1.");
      return;
    }
    setBusy(true);
    try {
      if (existing) {
        await update({ id: existing._id, name, sortOrder: order });
        toast.success("Category updated");
      } else {
        await create({ name, sortOrder: order });
        toast.success("Category created");
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
      open={category !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>
              {existing ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription>
              Categories appear as filter chips in the customer app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Veggie"
              required
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category-order">Sort order</Label>
            <Input
              id="category-order"
              type="number"
              min={1}
              step={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              required
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
