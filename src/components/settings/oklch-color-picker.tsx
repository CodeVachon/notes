"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconRefresh, IconDeviceFloppy } from "@tabler/icons-react";

interface OklchColor {
    l: string; // Lightness 0-1
    c: string; // Chroma 0-0.4+
    h: string; // Hue 0-360
}

interface OklchColorPickerProps {
    initialColor: OklchColor;
    defaultColor: OklchColor;
    onSave: (color: OklchColor) => void;
    onReset: () => void;
    disabled?: boolean;
}

// Helper function to derive semantic colors from primary
function applyDerivedColors(primary: OklchColor) {
    const root = document.documentElement;
    const l = parseFloat(primary.l);
    const c = parseFloat(primary.c);
    const h = parseFloat(primary.h);

    // Primary foreground - high contrast against primary
    const fgL = l > 0.6 ? 0.2 : 0.95;
    root.style.setProperty("--primary-foreground", `oklch(${fgL} ${c * 0.3} ${h})`);

    // Sidebar primary (slightly different lightness)
    root.style.setProperty("--sidebar-primary", `oklch(${Math.min(l + 0.09, 0.95)} ${c} ${h})`);
    root.style.setProperty(
        "--sidebar-primary-foreground",
        `oklch(${fgL} ${c * 0.3} ${h})`
    );

    // Chart colors - variations of the primary
    root.style.setProperty(
        "--chart-1",
        `oklch(${Math.min(l + 0.16, 0.95)} ${Math.max(c - 0.01, 0)} ${h - 8})`
    );
    root.style.setProperty(
        "--chart-2",
        `oklch(${Math.min(l + 0.09, 0.95)} ${c} ${h - 3})`
    );
    root.style.setProperty("--chart-3", `oklch(${l} ${c} ${h})`);
    root.style.setProperty(
        "--chart-4",
        `oklch(${Math.max(l - 0.1, 0.1)} ${Math.max(c - 0.02, 0)} ${h + 7})`
    );
    root.style.setProperty(
        "--chart-5",
        `oklch(${Math.max(l - 0.19, 0.1)} ${Math.max(c - 0.04, 0)} ${h + 8})`
    );
}

export function OklchColorPicker({
    initialColor,
    defaultColor,
    onSave,
    onReset,
    disabled
}: OklchColorPickerProps) {
    const [color, setColor] = useState<OklchColor>(initialColor);
    const [hasChanges, setHasChanges] = useState(false);

    // Apply live preview to CSS variables
    const applyPreview = useCallback((c: OklchColor) => {
        const oklchValue = `oklch(${c.l} ${c.c} ${c.h})`;
        document.documentElement.style.setProperty("--primary", oklchValue);
        applyDerivedColors(c);
    }, []);

    useEffect(() => {
        // Apply initial color on mount
        applyPreview(initialColor);
    }, [initialColor, applyPreview]);

    const handleChange = (key: keyof OklchColor, value: string) => {
        const newColor = { ...color, [key]: value };
        setColor(newColor);
        setHasChanges(true);
        applyPreview(newColor);
    };

    const handleSave = () => {
        onSave(color);
        setHasChanges(false);
    };

    const handleReset = () => {
        setColor(defaultColor);
        setHasChanges(false);
        applyPreview(defaultColor);
        onReset();
    };

    const oklchValue = `oklch(${color.l} ${color.c} ${color.h})`;

    return (
        <div className="space-y-4">
            {/* Color Preview */}
            <div className="flex items-center gap-4">
                <div
                    className="size-16 rounded-lg border shadow-sm"
                    style={{ backgroundColor: oklchValue }}
                />
                <div className="flex-1">
                    <p className="text-sm font-medium">Preview</p>
                    <p className="text-muted-foreground font-mono text-xs">{oklchValue}</p>
                </div>
            </div>

            {/* Sliders */}
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label>Lightness ({color.l})</Label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={color.l}
                        onChange={(e) => handleChange("l", e.target.value)}
                        disabled={disabled}
                        className="bg-muted h-2 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <p className="text-muted-foreground text-xs">
                        Controls brightness (0 = black, 1 = white)
                    </p>
                </div>

                <div className="grid gap-2">
                    <Label>Chroma ({color.c})</Label>
                    <input
                        type="range"
                        min="0"
                        max="0.4"
                        step="0.01"
                        value={color.c}
                        onChange={(e) => handleChange("c", e.target.value)}
                        disabled={disabled}
                        className="bg-muted h-2 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <p className="text-muted-foreground text-xs">Controls saturation intensity</p>
                </div>

                <div className="grid gap-2">
                    <Label>Hue ({color.h}deg)</Label>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        step="1"
                        value={color.h}
                        onChange={(e) => handleChange("h", e.target.value)}
                        disabled={disabled}
                        className="bg-muted h-2 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <p className="text-muted-foreground text-xs">
                        Color wheel position (0=red, 120=green, 240=blue)
                    </p>
                </div>
            </div>

            {/* Hue gradient preview */}
            <div
                className="h-4 w-full rounded-md"
                style={{
                    background: `linear-gradient(to right,
                        oklch(${color.l} ${color.c} 0),
                        oklch(${color.l} ${color.c} 60),
                        oklch(${color.l} ${color.c} 120),
                        oklch(${color.l} ${color.c} 180),
                        oklch(${color.l} ${color.c} 240),
                        oklch(${color.l} ${color.c} 300),
                        oklch(${color.l} ${color.c} 360)
                    )`
                }}
            />

            {/* Actions */}
            <div className="flex gap-2">
                <Button onClick={handleSave} disabled={disabled || !hasChanges}>
                    <IconDeviceFloppy className="size-4" />
                    Save Color
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={disabled}>
                    <IconRefresh className="size-4" />
                    Reset to Default
                </Button>
            </div>
        </div>
    );
}
