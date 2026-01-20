// BridgeComponent.cpp
// Claude Code → UE5.7 File-Based Bridge Implementation

#include "BridgeComponent.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "HAL/PlatformProcess.h"
#include "HAL/PlatformFileManager.h"
#include "JsonObjectConverter.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonWriter.h"
#include "Serialization/JsonSerializer.h"

// Directory watcher (editor-only)
#if WITH_DIRECTORY_WATCHER
#include "DirectoryWatcherModule.h"
#include "IDirectoryWatcher.h"
#endif


UBridgeComponent::UBridgeComponent()
{
    PrimaryComponentTick.bCanEverTick = true;

    // Default path: ~/.translators on Windows/Linux/Mac
    BridgePath = FPaths::Combine(FPlatformProcess::UserHomeDir(), TEXT(".translators"));
}


void UBridgeComponent::BeginPlay()
{
    Super::BeginPlay();

    BridgeLog(TEXT("========================================"));
    BridgeLog(TEXT("TRANSLATORS BRIDGE COMPONENT STARTING"));
    BridgeLog(FString::Printf(TEXT("Bridge Path: %s"), *BridgePath));
    BridgeLog(TEXT("========================================"));

    // Ensure bridge directory exists
    IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();
    if (!PlatformFile.DirectoryExists(*BridgePath))
    {
        PlatformFile.CreateDirectory(*BridgePath);
        BridgeLog(FString::Printf(TEXT("Created bridge directory: %s"), *BridgePath));
    }

    SetupFileWatcher();

    // Check if state file already exists (Claude Code may have started first)
    FString StateFilePath = GetBridgeFilePath(TEXT("state.json"));
    if (PlatformFile.FileExists(*StateFilePath))
    {
        BridgeLog(TEXT("Found existing state.json - processing..."));
        ProcessStateFile();
    }
}


void UBridgeComponent::EndPlay(const EEndPlayReason::Type EndPlayReason)
{
    TeardownFileWatcher();

    BridgeLog(TEXT("TRANSLATORS BRIDGE COMPONENT STOPPED"));

    Super::EndPlay(EndPlayReason);
}


void UBridgeComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    // Polling fallback for non-editor builds
    if (bUsePolling)
    {
        PollTimer += DeltaTime;
        if (PollTimer >= PollInterval)
        {
            PollTimer = 0.0f;

            FString StateFilePath = GetBridgeFilePath(TEXT("state.json"));
            IPlatformFile& PlatformFile = FPlatformFileManager::Get().GetPlatformFile();

            if (PlatformFile.FileExists(*StateFilePath))
            {
                FDateTime ModTime = PlatformFile.GetTimeStamp(*StateFilePath);
                if (ModTime > LastStateFileTime)
                {
                    LastStateFileTime = ModTime;
                    bStateChangePending = true;
                    TimeSinceLastStateChange = 0.0f;
                }
            }
        }
    }

    // Debounced state file processing
    if (bStateChangePending)
    {
        TimeSinceLastStateChange += DeltaTime;
        if (TimeSinceLastStateChange >= DebounceTime)
        {
            bStateChangePending = false;
            ProcessStateFile();
        }
    }

    // Debounced USD file processing
    if (bUsdChangePending)
    {
        TimeSinceLastUsdChange += DeltaTime;
        if (TimeSinceLastUsdChange >= DebounceTime)
        {
            bUsdChangePending = false;
            OnUsdFileChanged();
        }
    }
}


// === FILE WATCHING ===

void UBridgeComponent::SetupFileWatcher()
{
#if WITH_DIRECTORY_WATCHER
    FDirectoryWatcherModule& DirWatcherModule =
        FModuleManager::LoadModuleChecked<FDirectoryWatcherModule>(TEXT("DirectoryWatcher"));
    IDirectoryWatcher* DirWatcher = DirWatcherModule.Get();

    if (!DirWatcher)
    {
        BridgeLog(TEXT("ERROR: Could not get DirectoryWatcher module"));
        return;
    }

    IDirectoryWatcher::FDirectoryChanged Callback =
        IDirectoryWatcher::FDirectoryChanged::CreateUObject(
            this, &UBridgeComponent::OnDirectoryChanged);

    uint32 WatchFlags = 0; // No special flags needed

    bool bSuccess = DirWatcher->RegisterDirectoryChangedCallback_Handle(
        BridgePath, Callback, WatchHandle, WatchFlags);

    if (bSuccess)
    {
        BridgeLog(FString::Printf(TEXT("File watcher registered for: %s"), *BridgePath));
    }
    else
    {
        BridgeLog(TEXT("ERROR: Failed to register file watcher"));
    }
#else
    // Non-editor: Use polling in TickComponent
    BridgeLog(TEXT("DirectoryWatcher not available - using file polling"));
    bUsePolling = true;
#endif
}


void UBridgeComponent::TeardownFileWatcher()
{
#if WITH_DIRECTORY_WATCHER
    if (WatchHandle.IsValid())
    {
        FDirectoryWatcherModule& DirWatcherModule =
            FModuleManager::LoadModuleChecked<FDirectoryWatcherModule>(TEXT("DirectoryWatcher"));
        IDirectoryWatcher* DirWatcher = DirWatcherModule.Get();

        if (DirWatcher)
        {
            DirWatcher->UnregisterDirectoryChangedCallback_Handle(BridgePath, WatchHandle);
            BridgeLog(TEXT("File watcher unregistered"));
        }
    }
#endif
}


#if WITH_DIRECTORY_WATCHER
void UBridgeComponent::OnDirectoryChanged(const TArray<FFileChangeData>& Changes)
{
    for (const FFileChangeData& Change : Changes)
    {
        if (bVerboseLogging)
        {
            BridgeLog(FString::Printf(TEXT("File changed: %s"), *Change.Filename));
        }

        if (Change.Filename.EndsWith(TEXT("state.json")))
        {
            // Debounce state file changes
            TimeSinceLastStateChange = 0.0f;
            bStateChangePending = true;
        }
        else if (Change.Filename.EndsWith(TEXT(".usda")))
        {
            // Debounce USD file changes
            TimeSinceLastUsdChange = 0.0f;
            bUsdChangePending = true;
        }
    }
}
#endif


// === STATE HANDLING ===

void UBridgeComponent::ProcessStateFile()
{
    FString FilePath = GetBridgeFilePath(TEXT("state.json"));
    FString Content;

    if (!FFileHelper::LoadFileToString(Content, *FilePath))
    {
        if (bVerboseLogging)
        {
            BridgeLog(TEXT("Could not read state.json"));
        }
        return;
    }

    // Parse JSON
    TSharedPtr<FJsonObject> JsonObj;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(Content);

    if (!FJsonSerializer::Deserialize(Reader, JsonObj) || !JsonObj.IsValid())
    {
        BridgeLog(TEXT("ERROR: Invalid JSON in state.json"));
        return;
    }

    CurrentStateJson = Content;

    // Route by type
    FString StateType;
    if (JsonObj->TryGetStringField(TEXT("type"), StateType))
    {
        if (StateType == TEXT("ready"))
        {
            HandleReadyState(JsonObj);
        }
        else if (StateType == TEXT("question"))
        {
            HandleQuestionState(JsonObj);
        }
        else if (StateType == TEXT("transition"))
        {
            HandleTransitionState(JsonObj);
        }
        else if (StateType == TEXT("finale"))
        {
            HandleFinaleState(JsonObj);
        }
        else
        {
            BridgeLog(FString::Printf(TEXT("Unknown state type: %s"), *StateType));
        }
    }
}


void UBridgeComponent::HandleReadyState(const TSharedPtr<FJsonObject>& JsonObj)
{
    int32 TotalQuestions = JsonObj->GetIntegerField(TEXT("total_questions"));
    FString FirstScene = JsonObj->GetStringField(TEXT("first_scene"));

    BridgeLog(FString::Printf(TEXT("Claude Code ready! Total questions: %d, First scene: %s"),
        TotalQuestions, *FirstScene));

    bIsConnected = true;
    OnBridgeReady.Broadcast(TotalQuestions);
}


void UBridgeComponent::HandleQuestionState(const TSharedPtr<FJsonObject>& JsonObj)
{
    // Parse into struct
    CurrentQuestion = FTranslatorsQuestion();
    CurrentQuestion.Index = JsonObj->GetIntegerField(TEXT("index"));
    CurrentQuestion.Total = JsonObj->GetIntegerField(TEXT("total"));
    CurrentQuestion.QuestionId = JsonObj->GetStringField(TEXT("id"));
    CurrentQuestion.Text = JsonObj->GetStringField(TEXT("text"));
    CurrentQuestion.Scene = JsonObj->GetStringField(TEXT("scene"));

    // Parse options array
    const TArray<TSharedPtr<FJsonValue>>* OptionsArray;
    if (JsonObj->TryGetArrayField(TEXT("options"), OptionsArray))
    {
        for (const TSharedPtr<FJsonValue>& OptionVal : *OptionsArray)
        {
            const TSharedPtr<FJsonObject>& OptionObj = OptionVal->AsObject();
            if (OptionObj.IsValid())
            {
                CurrentQuestion.OptionLabels.Add(OptionObj->GetStringField(TEXT("label")));
                CurrentQuestion.OptionDirections.Add(OptionObj->GetStringField(TEXT("direction")));
            }
        }
    }

    BridgeLog(FString::Printf(TEXT("Question %d/%d: %s"),
        CurrentQuestion.Index + 1, CurrentQuestion.Total, *CurrentQuestion.QuestionId));

    // Broadcast raw JSON for flexible handling
    OnQuestionReceived.Broadcast(CurrentStateJson);
}


void UBridgeComponent::HandleTransitionState(const TSharedPtr<FJsonObject>& JsonObj)
{
    FString Direction = JsonObj->GetStringField(TEXT("direction"));
    FString NextScene = JsonObj->GetStringField(TEXT("next_scene"));
    float Progress = JsonObj->GetNumberField(TEXT("progress"));

    BridgeLog(FString::Printf(TEXT("Transition: %s -> %s (%.0f%%)"),
        *Direction, *NextScene, Progress * 100.0f));

    OnTransitionReceived.Broadcast(Direction, NextScene);
}


void UBridgeComponent::HandleFinaleState(const TSharedPtr<FJsonObject>& JsonObj)
{
    FString UsdPath = JsonObj->GetStringField(TEXT("usd_path"));
    FString Message = JsonObj->GetStringField(TEXT("message"));

    BridgeLog(FString::Printf(TEXT("FINALE: %s"), *Message));
    BridgeLog(FString::Printf(TEXT("USD Path: %s"), *UsdPath));

    OnFinaleReceived.Broadcast(UsdPath);
}


// === USD HANDLING ===

void UBridgeComponent::OnUsdFileChanged()
{
    BridgeLog(TEXT("USD file changed - reloading stage"));
    ReloadUsdStage();
    OnUsdUpdated.Broadcast();
}


void UBridgeComponent::ReloadUsdStage()
{
    // USD Stage reload is handled via Blueprint event OnUsdUpdated
    // Blueprints can call the USD Stage Actor's reload methods directly
    // This avoids C++ dependency on USDImporter module at runtime

    BridgeLog(TEXT("USD file changed - Broadcast OnUsdUpdated for Blueprint handling"));

    // The OnUsdUpdated delegate has already been broadcast in OnUsdFileChanged()
    // Blueprint implementations should handle the actual reload
}


void UBridgeComponent::ForceReloadUsdStage()
{
    ReloadUsdStage();
}


// === BLUEPRINT CALLABLE FUNCTIONS ===

void UBridgeComponent::SendAcknowledge()
{
    TSharedPtr<FJsonObject> JsonObj = MakeShared<FJsonObject>();
    JsonObj->SetStringField(TEXT("$schema"), TEXT("translators-answer-v1"));
    JsonObj->SetStringField(TEXT("type"), TEXT("ack"));
    JsonObj->SetStringField(TEXT("timestamp"), FDateTime::UtcNow().ToIso8601());

    TSharedPtr<FJsonObject> AckObj = MakeShared<FJsonObject>();
    AckObj->SetBoolField(TEXT("ready"), true);
    AckObj->SetStringField(TEXT("ue_version"), TEXT("5.7.0"));
    AckObj->SetStringField(TEXT("project"), TEXT("TranslatorsCard"));
    JsonObj->SetObjectField(TEXT("ack"), AckObj);

    WriteJsonToFile(TEXT("answer.json"), JsonObj);
    BridgeLog(TEXT("Sent acknowledgment to Claude Code"));
}


void UBridgeComponent::SendAnswer(const FString& QuestionId, int32 OptionIndex, float ResponseTimeMs)
{
    TSharedPtr<FJsonObject> JsonObj = MakeShared<FJsonObject>();
    JsonObj->SetStringField(TEXT("$schema"), TEXT("translators-answer-v1"));
    JsonObj->SetStringField(TEXT("type"), TEXT("answer"));
    JsonObj->SetStringField(TEXT("timestamp"), FDateTime::UtcNow().ToIso8601());

    TSharedPtr<FJsonObject> AnswerObj = MakeShared<FJsonObject>();
    AnswerObj->SetStringField(TEXT("question_id"), QuestionId);
    AnswerObj->SetNumberField(TEXT("option_index"), OptionIndex);
    AnswerObj->SetNumberField(TEXT("response_time_ms"), ResponseTimeMs);
    JsonObj->SetObjectField(TEXT("answer"), AnswerObj);

    WriteJsonToFile(TEXT("answer.json"), JsonObj);

    BridgeLog(FString::Printf(TEXT("Sent answer: %s = option %d (%.0fms)"),
        *QuestionId, OptionIndex, ResponseTimeMs));
}


FTranslatorsQuestion UBridgeComponent::GetCurrentQuestion() const
{
    return CurrentQuestion;
}


// === UTILITY ===

void UBridgeComponent::WriteJsonToFile(const FString& Filename, const TSharedPtr<FJsonObject>& JsonObj)
{
    FString FilePath = GetBridgeFilePath(Filename);
    FString OutputString;

    TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&OutputString);
    FJsonSerializer::Serialize(JsonObj.ToSharedRef(), Writer);

    // Write with retry logic (file may be locked by Claude Code reading it)
    int32 MaxRetries = 3;
    for (int32 Retry = 0; Retry < MaxRetries; ++Retry)
    {
        if (FFileHelper::SaveStringToFile(OutputString, *FilePath))
        {
            return; // Success
        }

        if (Retry < MaxRetries - 1)
        {
            BridgeLog(FString::Printf(TEXT("Write failed, retry %d/%d..."), Retry + 1, MaxRetries));
            FPlatformProcess::Sleep(0.1f);
        }
    }

    BridgeLog(FString::Printf(TEXT("ERROR: Failed to write %s after %d retries"), *Filename, MaxRetries));
}


FString UBridgeComponent::GetBridgeFilePath(const FString& Filename) const
{
    return FPaths::Combine(BridgePath, Filename);
}


void UBridgeComponent::BridgeLog(const FString& Message) const
{
    UE_LOG(LogTemp, Log, TEXT("[TranslatorsBridge] %s"), *Message);

    // Also log to console for Blueprint visibility
    if (GEngine)
    {
        GEngine->AddOnScreenDebugMessage(-1, 5.0f, FColor::Cyan,
            FString::Printf(TEXT("[Bridge] %s"), *Message));
    }
}
