// TranslatorsCard.h
// Module header for the Translators Card game

#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

class FTranslatorsCardModule : public IModuleInterface
{
public:
    /** IModuleInterface implementation */
    virtual void StartupModule() override;
    virtual void ShutdownModule() override;
};
