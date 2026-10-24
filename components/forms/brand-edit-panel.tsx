"use client";

import { useState } from "react";

import { updateBrandAction } from "@/app/brands/actions";
import { BrandForm, type BrandFormValues } from "@/components/forms/brand-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BrandEditPanel({ brand }: { brand: BrandFormValues & { id: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateAction = updateBrandAction.bind(null, brand.id);

  if (isEditing) {
    return (
      <BrandForm
        action={updateAction}
        defaultValues={brand}
        title="Edit brand information"
        submitLabel="Save changes"
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit brand information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          Update the brand profile, business context, channels, and financial baselines.
        </p>
        <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
          Edit brand
        </Button>
      </CardContent>
    </Card>
  );
}
