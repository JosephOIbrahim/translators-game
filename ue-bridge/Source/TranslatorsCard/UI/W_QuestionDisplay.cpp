// W_QuestionDisplay.cpp
// Implementation of main question display widget

#include "W_QuestionDisplay.h"
#include "W_OptionButton.h"
#include "Components/VerticalBox.h"
#include "Components/VerticalBoxSlot.h"
#include "Components/TextBlock.h"
#include "Components/Border.h"
#include "Blueprint/WidgetTree.h"


UW_QuestionDisplay::UW_QuestionDisplay(const FObjectInitializer& ObjectInitializer)
    : Super(ObjectInitializer)
{
    // Default 8-bit colors
    BackgroundColor = FLinearColor(0.05f, 0.05f, 0.08f, 0.95f);
    QuestionTextColor = FLinearColor(1.0f, 1.0f, 1.0f, 1.0f);
    ProgressTextColor = FLinearColor(0.5f, 0.5f, 0.5f, 1.0f);
}


void UW_QuestionDisplay::NativeConstruct()
{
    Super::NativeConstruct();

    // Apply background color
    if (BackgroundBorder)
    {
        BackgroundBorder->SetBrushColor(BackgroundColor);
    }

    // Apply text colors
    if (QuestionText)
    {
        QuestionText->SetColorAndOpacity(FSlateColor(QuestionTextColor));
    }
    if (ProgressText)
    {
        ProgressText->SetColorAndOpacity(FSlateColor(ProgressTextColor));
    }

    UE_LOG(LogTemp, Log, TEXT("[W_QuestionDisplay] Constructed"));
}


void UW_QuestionDisplay::ShowQuestion(const FTranslatorsQuestion& Question)
{
    CurrentQuestion = Question;
    SelectedOptionIndex = -1;

    // Update question text
    if (QuestionText)
    {
        // Replace \n with actual newlines
        FString FormattedText = Question.Text.Replace(TEXT("\\n"), TEXT("\n"));
        QuestionText->SetText(FText::FromString(FormattedText));
    }

    // Update progress
    UpdateProgress(Question.Index + 1, Question.Total);

    // Create option buttons
    CreateOptionButtons();

    UE_LOG(LogTemp, Log, TEXT("[W_QuestionDisplay] Showing question %d/%d: %s"),
        Question.Index + 1, Question.Total, *Question.QuestionId);
}


void UW_QuestionDisplay::UpdateProgress(int32 Current, int32 Total)
{
    if (ProgressText)
    {
        FString ProgressString = FString::Printf(TEXT("%d / %d"), Current, Total);
        ProgressText->SetText(FText::FromString(ProgressString));
    }
}


void UW_QuestionDisplay::ClearOptions()
{
    // Remove existing option buttons
    for (UW_OptionButton* Button : OptionButtons)
    {
        if (Button)
        {
            Button->OnOptionClicked.RemoveAll(this);
            Button->RemoveFromParent();
        }
    }
    OptionButtons.Empty();
    SelectedOptionIndex = -1;
}


void UW_QuestionDisplay::SetDisplayVisible(bool bVisible)
{
    if (bVisible)
    {
        SetVisibility(ESlateVisibility::Visible);
        // Could add fade-in animation here
    }
    else
    {
        SetVisibility(ESlateVisibility::Hidden);
        // Could add fade-out animation here
    }
}


void UW_QuestionDisplay::CreateOptionButtons()
{
    // Clear existing buttons first
    ClearOptions();

    if (!OptionsContainer)
    {
        UE_LOG(LogTemp, Warning, TEXT("[W_QuestionDisplay] No OptionsContainer - cannot create buttons"));
        return;
    }

    // Determine button class to use
    TSubclassOf<UW_OptionButton> ButtonClass = OptionButtonClass;
    if (!ButtonClass)
    {
        // Fallback to base class if no Blueprint class specified
        ButtonClass = UW_OptionButton::StaticClass();
    }

    // Create a button for each option
    const int32 NumOptions = CurrentQuestion.OptionLabels.Num();
    for (int32 i = 0; i < NumOptions; i++)
    {
        UW_OptionButton* NewButton = CreateWidget<UW_OptionButton>(this, ButtonClass);
        if (NewButton)
        {
            // Set up the option data
            FText Label = FText::FromString(CurrentQuestion.OptionLabels[i]);
            FString Dir = CurrentQuestion.OptionDirections.IsValidIndex(i)
                ? CurrentQuestion.OptionDirections[i]
                : TEXT("forward");

            NewButton->SetupOption(i, Label, Dir);

            // Bind click event
            NewButton->OnOptionClicked.AddDynamic(this, &UW_QuestionDisplay::HandleOptionClicked);

            // Add to container
            UVerticalBoxSlot* Slot = OptionsContainer->AddChildToVerticalBox(NewButton);
            if (Slot)
            {
                // Add some padding between buttons
                Slot->SetPadding(FMargin(0.0f, 5.0f, 0.0f, 5.0f));
            }

            OptionButtons.Add(NewButton);

            UE_LOG(LogTemp, Log, TEXT("[W_QuestionDisplay] Created option button %d: %s"),
                i, *CurrentQuestion.OptionLabels[i]);
        }
    }
}


void UW_QuestionDisplay::HandleOptionClicked(int32 OptionIndex)
{
    if (SelectedOptionIndex != -1)
    {
        // Already selected - ignore double clicks
        UE_LOG(LogTemp, Warning, TEXT("[W_QuestionDisplay] Ignoring click - already answered"));
        return;
    }

    SelectedOptionIndex = OptionIndex;

    // Visual feedback - highlight selected, dim others
    for (int32 i = 0; i < OptionButtons.Num(); i++)
    {
        if (OptionButtons[i])
        {
            OptionButtons[i]->SetHighlighted(i == OptionIndex);
        }
    }

    UE_LOG(LogTemp, Log, TEXT("[W_QuestionDisplay] Answer selected: option %d"), OptionIndex);

    // Broadcast to listeners (HUD will handle sending to bridge)
    OnAnswerSelected.Broadcast(OptionIndex);
}
