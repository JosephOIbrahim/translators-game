// TranslatorsCard.Build.cs
// Build configuration for Claude Code → UE5.7 Bridge
//
// Key modules:
// - DirectoryWatcher: For file change detection
// - USDImporter: For USD Stage Actor integration
// - Json/JsonUtilities: For protocol message handling

using UnrealBuildTool;

public class TranslatorsCard : ModuleRules
{
    public TranslatorsCard(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        // Core modules
        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore"
        });

        // JSON handling for protocol messages
        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Json",
            "JsonUtilities"
        });

        // File watching (Editor-only - use polling in packaged builds)
        if (Target.bBuildEditor)
        {
            PrivateDependencyModuleNames.Add("DirectoryWatcher");
            PrivateDefinitions.Add("WITH_DIRECTORY_WATCHER=1");

            // USD support (editor-only)
            // Note: USD integration is handled via Blueprint, not C++
            PrivateDefinitions.Add("WITH_USD_SUPPORT=1");
        }

        // UMG / Slate UI support (required for question display widgets)
        PrivateDependencyModuleNames.AddRange(new string[]
        {
            "Slate",
            "SlateCore",
            "UMG"
        });

        // Enable IWYU (Include What You Use)
        bEnforceIWYU = true;

        // Ensure generated headers are available
        PublicIncludePaths.Add(ModuleDirectory);
        PrivateIncludePaths.Add(ModuleDirectory + "/UI");
    }
}
