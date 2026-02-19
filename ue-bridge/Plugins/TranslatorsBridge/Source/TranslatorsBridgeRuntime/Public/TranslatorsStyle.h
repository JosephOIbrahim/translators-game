// TranslatorsStyle.h
// Centralized Slate style set for Translators Bridge UI.
// All widgets pull colors, fonts, and styles from here instead of hardcoding.

#pragma once

#include "CoreMinimal.h"
#include "Styling/SlateStyle.h"
#include "Styling/SlateStyleRegistry.h"

/**
 * FTranslatorsStyle -- Slate style set for all Translators Bridge widgets.
 *
 * Usage from any widget:
 *   const FLinearColor& Bg = FTranslatorsStyle::GetColor("Color.Background");
 *   const FSlateFontInfo& Font = FTranslatorsStyle::GetFont("Font.Title");
 */
class TRANSLATORSBRIDGERUNTIME_API FTranslatorsStyle
{
public:
	/** Register the style set. Call from module StartupModule(). */
	static void Initialize();

	/** Unregister the style set. Call from module ShutdownModule(). */
	static void Shutdown();

	/** Get a named color from the style set */
	static FLinearColor GetColor(const FName& PropertyName);

	/** Get a named font from the style set */
	static FSlateFontInfo GetFont(const FName& PropertyName);

	/** Get the style set name */
	static FName GetStyleSetName();

	/** Get the full style set (for advanced usage) */
	static const ISlateStyle& Get();

private:
	static TSharedPtr<FSlateStyleSet> StyleInstance;
	static TSharedRef<FSlateStyleSet> Create();
};
