// W_OptionButton.cpp
// Implementation of clickable answer option button

#include "W_OptionButton.h"
#include "Components/Button.h"
#include "Components/TextBlock.h"
#include "Components/Border.h"


UW_OptionButton::UW_OptionButton(const FObjectInitializer& ObjectInitializer)
    : Super(ObjectInitializer)
{
    // Default 8-bit color scheme
    NormalColor = FLinearColor(0.1f, 0.1f, 0.15f, 1.0f);      // Dark blue-gray
    HoveredColor = FLinearColor(0.2f, 0.4f, 0.5f, 1.0f);      // Teal
    PressedColor = FLinearColor(0.36f, 1.0f, 0.86f, 1.0f);    // Cyan (matches PALETTE.glowCyan)
    TextColor = FLinearColor(0.9f, 0.9f, 0.9f, 1.0f);         // Off-white
}


void UW_OptionButton::NativeConstruct()
{
    Super::NativeConstruct();

    // Bind button events if button exists
    if (OptionButton)
    {
        OptionButton->OnClicked.AddDynamic(this, &UW_OptionButton::HandleButtonClicked);
        OptionButton->OnHovered.AddDynamic(this, &UW_OptionButton::HandleButtonHovered);
        OptionButton->OnUnhovered.AddDynamic(this, &UW_OptionButton::HandleButtonUnhovered);

        // Make focusable for keyboard navigation
        OptionButton->SetIsFocusable(true);
    }

    // Set initial visual state
    UpdateVisualState(NormalColor);

    // Set label text if available
    if (OptionLabel && !LabelText.IsEmpty())
    {
        OptionLabel->SetText(LabelText);
        OptionLabel->SetColorAndOpacity(FSlateColor(TextColor));
    }
}


void UW_OptionButton::NativeDestruct()
{
    // Unbind events
    if (OptionButton)
    {
        OptionButton->OnClicked.RemoveAll(this);
        OptionButton->OnHovered.RemoveAll(this);
        OptionButton->OnUnhovered.RemoveAll(this);
    }

    Super::NativeDestruct();
}


void UW_OptionButton::SetupOption(int32 Index, const FText& Label, const FString& Dir)
{
    OptionIndex = Index;
    LabelText = Label;
    Direction = Dir;

    // Update label if widget exists
    if (OptionLabel)
    {
        OptionLabel->SetText(LabelText);
    }

    UE_LOG(LogTemp, Log, TEXT("[W_OptionButton] Setup option %d: %s (dir: %s)"),
        Index, *Label.ToString(), *Dir);
}


void UW_OptionButton::SetHighlighted(bool bHighlighted)
{
    if (bHighlighted)
    {
        UpdateVisualState(HoveredColor);
    }
    else
    {
        UpdateVisualState(NormalColor);
    }
}


void UW_OptionButton::SimulateClick()
{
    HandleButtonClicked();
}


void UW_OptionButton::HandleButtonClicked()
{
    UE_LOG(LogTemp, Log, TEXT("[W_OptionButton] Option %d clicked"), OptionIndex);

    // Visual feedback
    UpdateVisualState(PressedColor);

    // Broadcast the click event
    OnOptionClicked.Broadcast(OptionIndex);

    // Return to normal after brief delay (handled by caller typically)
}


void UW_OptionButton::HandleButtonHovered()
{
    UpdateVisualState(HoveredColor);

    // Optional: Play hover sound
    // UGameplayStatics::PlaySound2D(this, HoverSound);
}


void UW_OptionButton::HandleButtonUnhovered()
{
    UpdateVisualState(NormalColor);
}


void UW_OptionButton::UpdateVisualState(const FLinearColor& BackgroundColor)
{
    if (ButtonBorder)
    {
        ButtonBorder->SetBrushColor(BackgroundColor);
    }
    else if (OptionButton)
    {
        // Fallback: tint the button itself
        FButtonStyle Style = OptionButton->GetStyle();
        Style.Normal.TintColor = FSlateColor(BackgroundColor);
        Style.Hovered.TintColor = FSlateColor(HoveredColor);
        Style.Pressed.TintColor = FSlateColor(PressedColor);
        OptionButton->SetStyle(Style);
    }
}
