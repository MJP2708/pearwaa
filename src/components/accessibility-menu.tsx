"use client";

import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAccessibility } from "@/components/providers/accessibility-provider";

export function AccessibilityMenu() {
  const { reducedMotion, highContrast, setReducedMotion, setHighContrast } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Display settings"
            className="rounded-full text-muted-foreground hover:text-foreground"
          />
        }
      >
        <Settings2 className="size-[18px]" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 rounded-2xl p-5">
        <p className="mb-4 text-sm font-medium text-foreground">Display</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-sm font-normal">
                Reduce motion
              </Label>
              <p className="text-xs text-muted-foreground">Turns off gentle animation throughout Pearwaa.</p>
            </div>
            <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-sm font-normal">
                High contrast
              </Label>
              <p className="text-xs text-muted-foreground">Deepens text and borders for easier reading.</p>
            </div>
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
