import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BrandFoundationForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand context</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand name</Label>
              <Input id="brand-name" placeholder="Example: Acme Skincare" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="Example: DTC beauty" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-offer">Primary offer</Label>
              <Input id="primary-offer" placeholder="Example: starter bundle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary-channel">Primary channel</Label>
              <Input id="primary-channel" placeholder="Example: Meta Ads" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Business context</Label>
            <Textarea
              id="context"
              placeholder="Capture current goals, known constraints, funnel notes, team context, and available data sources."
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" disabled>
              Save brand later
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
