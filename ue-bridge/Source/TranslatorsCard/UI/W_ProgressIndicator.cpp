// W_ProgressIndicator.cpp
// Implementation of progress indicator widget

#include "W_ProgressIndicator.h"
#include "Components/HorizontalBox.h"
#include "Components/HorizontalBoxSlot.h"
#include "Components/Image.h"
#include "Components/TextBlock.h"
#include "Blueprint/WidgetTree.h"


UW_ProgressIndicator::UW_ProgressIndicator(const FObjectInitializer& ObjectInitializer)
    : Super(ObjectInitializer)
{
    TotalQuestions = 8;
    CurrentQuestion = 0;

    // 8-bit color scheme
    CompletedColor = FLinearColor(0.36f, 1.0f, 0.86f, 1.0f);  // Cyan (#5cffdb)
    IncompleteColor = FLinearColor(0.3f, 0.3f, 0.3f, 0.5f);   // Dim gray
    CurrentColor = FLinearColor(1.0f, 0.8f, 0.2f, 1.0f);      // Gold
}


void UW_ProgressIndicator::NativeConstruct()
{
    Super::NativeConstruct();

    // Create indicator images if we have a container
    if (IndicatorContainer)
    {
        IndicatorContainer->ClearChildren();
        IndicatorImages.Empty();

        for (int32 i = 0; i < TotalQuestions; i++)
        {
            UImage* Indicator = WidgetTree->ConstructWidget<UImage>(UImage::StaticClass());
            if (Indicator)
            {
                // Set size (small square)
                Indicator->SetDesiredSizeOverride(FVector2D(12.0f, 12.0f));

                // Add to container
                UHorizontalBoxSlot* Slot = IndicatorContainer->AddChildToHorizontalBox(Indicator);
                if (Slot)
                {
                    Slot->SetPadding(FMargin(4.0f, 0.0f, 4.0f, 0.0f));
                    Slot->SetVerticalAlignment(VAlign_Center);
                }

                IndicatorImages.Add(Indicator);
            }
        }
    }

    // Initial state
    RefreshIndicators();

    UE_LOG(LogTemp, Log, TEXT("[W_ProgressIndicator] Constructed with %d slots"), TotalQuestions);
}


void UW_ProgressIndicator::UpdateProgress(int32 QuestionsCompleted)
{
    CurrentQuestion = FMath::Clamp(QuestionsCompleted, 0, TotalQuestions);
    RefreshIndicators();

    UE_LOG(LogTemp, Log, TEXT("[W_ProgressIndicator] Progress: %d/%d (%.0f%%)"),
        CurrentQuestion, TotalQuestions, GetCompletionPercent() * 100.0f);
}


void UW_ProgressIndicator::SetTotalQuestions(int32 Total)
{
    TotalQuestions = FMath::Max(1, Total);

    // Rebuild indicators if needed
    if (IndicatorImages.Num() != TotalQuestions && IndicatorContainer)
    {
        // Clear and rebuild
        IndicatorContainer->ClearChildren();
        IndicatorImages.Empty();

        for (int32 i = 0; i < TotalQuestions; i++)
        {
            UImage* Indicator = WidgetTree->ConstructWidget<UImage>(UImage::StaticClass());
            if (Indicator)
            {
                Indicator->SetDesiredSizeOverride(FVector2D(12.0f, 12.0f));
                UHorizontalBoxSlot* Slot = IndicatorContainer->AddChildToHorizontalBox(Indicator);
                if (Slot)
                {
                    Slot->SetPadding(FMargin(4.0f, 0.0f, 4.0f, 0.0f));
                }
                IndicatorImages.Add(Indicator);
            }
        }
    }

    RefreshIndicators();
}


float UW_ProgressIndicator::GetCompletionPercent() const
{
    if (TotalQuestions <= 0)
    {
        return 0.0f;
    }
    return static_cast<float>(CurrentQuestion) / static_cast<float>(TotalQuestions);
}


void UW_ProgressIndicator::RefreshIndicators()
{
    // Update indicator colors
    for (int32 i = 0; i < IndicatorImages.Num(); i++)
    {
        UImage* Indicator = IndicatorImages[i];
        if (!Indicator) continue;

        FLinearColor Color;
        if (i < CurrentQuestion)
        {
            // Completed
            Color = CompletedColor;
        }
        else if (i == CurrentQuestion)
        {
            // Current (in progress)
            Color = CurrentColor;
        }
        else
        {
            // Not yet reached
            Color = IncompleteColor;
        }

        Indicator->SetColorAndOpacity(Color);
    }

    // Update text label
    if (ProgressLabel)
    {
        FString LabelText = FString::Printf(TEXT("%d / %d"), CurrentQuestion, TotalQuestions);
        ProgressLabel->SetText(FText::FromString(LabelText));
    }
}
