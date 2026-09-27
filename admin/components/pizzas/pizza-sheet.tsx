"use client";

import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ImageUp, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PizzaImage } from "@/components/pizzas/pizza-image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/errors";
import { centsToInput, parsePriceToCents } from "@/lib/format";

export type AdminPizza = FunctionReturnType<
  typeof api.pizzas.adminList
>[number];

const SIZES = [
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
] as const;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function PizzaSheet({
  pizza,
  onClose,
}: {
  pizza: AdminPizza | "new" | null;
  onClose: () => void;
}) {
  const categories = useQuery(api.categories.list);
  const ingredients = useQuery(api.ingredients.list);
  const create = useMutation(api.pizzas.create);
  const update = useMutation(api.pizzas.update);
  const generateUploadUrl = useMutation(api.pizzas.generateUploadUrl);

  const existing = pizza && pizza !== "new" ? pizza : null;
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    existing?.categoryId ?? "",
  );
  const [ingredientIds, setIngredientIds] = useState<Set<Id<"ingredients">>>(
    () => new Set(existing?.ingredientIds ?? []),
  );
  const [prices, setPrices] = useState({
    small: existing ? centsToInput(existing.prices.small) : "",
    medium: existing ? centsToInput(existing.prices.medium) : "",
    large: existing ? centsToInput(existing.prices.large) : "",
  });
  const [isAvailable, setIsAvailable] = useState(existing?.isAvailable ?? true);
  const [imageId, setImageId] = useState<Id<"_storage"> | undefined>(
    existing?.imageId,
  );
  const [preview, setPreview] = useState<string | null>(
    existing?.imageUrl ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Revoke local blob: previews when they're replaced or the sheet closes.
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function onPickImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Images must be 5 MB or smaller.");
      return;
    }
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
      setImageId(storageId);
      setPreview(URL.createObjectURL(file));
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function toggleIngredient(id: Id<"ingredients">, checked: boolean) {
    setIngredientIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      toast.error("Pick a category.");
      return;
    }
    const cents = {
      small: parsePriceToCents(prices.small),
      medium: parsePriceToCents(prices.medium),
      large: parsePriceToCents(prices.large),
    };
    if (cents.small === null || cents.medium === null || cents.large === null) {
      toast.error("Enter a valid price for every size, like 12.99.");
      return;
    }
    const fields = {
      name,
      description,
      categoryId: categoryId as Id<"categories">,
      ingredientIds: [...ingredientIds],
      prices: { small: cents.small, medium: cents.medium, large: cents.large },
      imageId,
      isAvailable,
    };
    setSaving(true);
    try {
      if (existing) {
        await update({ id: existing._id, ...fields });
        toast.success(`${name} updated`);
      } else {
        await create(fields);
        toast.success(`${name} added to the menu`);
      }
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={pizza !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <form onSubmit={onSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>
              {existing ? `Edit ${existing.name}` : "New pizza"}
            </SheetTitle>
            <SheetDescription>
              Changes go live on the customer menu instantly.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            <div className="flex items-center gap-4">
              <PizzaImage
                src={preview}
                alt={name || "Pizza"}
                className="size-24 rounded-xl"
              />
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickImage(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInput.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ImageUp />
                  )}
                  {preview ? "Replace photo" : "Upload photo"}
                </Button>
                {preview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageId(undefined);
                      setPreview(null);
                    }}
                  >
                    <X /> Remove
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pizza-name">Name</Label>
              <Input
                id="pizza-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Margherita"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pizza-description">Description</Label>
              <Textarea
                id="pizza-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes it good?"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Prices</Label>
              <div className="grid grid-cols-3 gap-3">
                {SIZES.map((size) => (
                  <div key={size.key} className="grid gap-1">
                    <span className="text-xs text-muted-foreground">
                      {size.label}
                    </span>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        inputMode="decimal"
                        value={prices[size.key]}
                        onChange={(e) =>
                          setPrices((p) => ({
                            ...p,
                            [size.key]: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-6 tabular-nums"
                        required
                        aria-label={`${size.label} price`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>
                Ingredients{" "}
                <span className="font-normal text-muted-foreground">
                  ({ingredientIds.size} selected)
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                {ingredients?.map((ingredient) => (
                  <label
                    key={ingredient._id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={ingredientIds.has(ingredient._id)}
                      onCheckedChange={(checked) =>
                        toggleIngredient(ingredient._id, checked === true)
                      }
                    />
                    <span
                      className={
                        ingredient.inStock
                          ? ""
                          : "text-muted-foreground line-through"
                      }
                    >
                      {ingredient.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="pizza-available">Show on menu</Label>
                <p className="text-xs text-muted-foreground">
                  Hidden pizzas can&apos;t be ordered.
                </p>
              </div>
              <Switch
                id="pizza-available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>
          </div>

          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving && <Loader2 className="animate-spin" />}
              {existing ? "Save changes" : "Add pizza"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
