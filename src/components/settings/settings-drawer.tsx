"use client";

import { useTransition } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconX } from "@tabler/icons-react";
import { OklchColorPicker } from "./oklch-color-picker";
import { updateTimeFormat, updatePrimaryColor, resetPrimaryColor } from "@/app/settings/actions";
import { useSettings } from "@/lib/settings-context";
import { DEFAULT_PRIMARY_COLOR, type TimeFormat } from "@/db/schema";

interface SettingsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
    const [isPending, startTransition] = useTransition();
    const { settings } = useSettings();

    // Get current primary color or default
    const currentColor = settings.primaryColorL
        ? {
              l: settings.primaryColorL,
              c: settings.primaryColorC!,
              h: settings.primaryColorH!
          }
        : DEFAULT_PRIMARY_COLOR;

    const handleTimeFormatChange = (value: TimeFormat) => {
        startTransition(async () => {
            await updateTimeFormat(value);
        });
    };

    const handleColorSave = (color: { l: string; c: string; h: string }) => {
        startTransition(async () => {
            await updatePrimaryColor(color);
        });
    };

    const handleColorReset = () => {
        startTransition(async () => {
            await resetPrimaryColor();
        });
    };

    return (
        <Drawer direction="right" open={open} onOpenChange={onOpenChange} handleOnly>
            <DrawerContent className="h-full sm:max-w-md">
                <DrawerHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <DrawerTitle>Settings</DrawerTitle>
                            <DrawerDescription>
                                Customize your app experience
                            </DrawerDescription>
                        </div>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon-xs">
                                <IconX className="size-4" />
                            </Button>
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-6">
                        {/* Time Format Setting */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-medium">Time Display</h3>
                                <p className="text-muted-foreground text-xs">
                                    Choose how times are displayed throughout the app
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="time-format">Time Format</Label>
                                <select
                                    id="time-format"
                                    value={settings.timeFormat}
                                    onChange={(e) =>
                                        handleTimeFormatChange(e.target.value as TimeFormat)
                                    }
                                    disabled={isPending}
                                    className="border-input bg-input/30 focus:border-ring focus:ring-ring/30 h-8 w-full rounded-md border px-2 text-xs outline-none focus:ring-2 [&>option]:bg-popover [&>option]:text-popover-foreground"
                                >
                                    <option value="12h">12-hour (2:30 PM)</option>
                                    <option value="24h">24-hour (14:30)</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-border h-px" />

                        {/* Primary Color Setting */}
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-medium">Theme Color</h3>
                                <p className="text-muted-foreground text-xs">
                                    Customize the primary accent color
                                </p>
                            </div>
                            <OklchColorPicker
                                initialColor={currentColor}
                                defaultColor={DEFAULT_PRIMARY_COLOR}
                                onSave={handleColorSave}
                                onReset={handleColorReset}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
