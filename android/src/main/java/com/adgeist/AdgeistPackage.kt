package com.adgeist

import androidx.annotation.Nullable
import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.adgeist.implementation.AdgeistModuleImpl
import java.util.HashMap

class AdgeistPackage : TurboReactPackage() {

  @Nullable
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == AdgeistModuleImpl.NAME) {
      AdgeistModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos = HashMap<String, ReactModuleInfo>()
      moduleInfos[AdgeistModuleImpl.NAME] = ReactModuleInfo(
        AdgeistModuleImpl.NAME,
        AdgeistModuleImpl.NAME,
        false, // canOverrideExistingModule
        false, // needsEagerInit
        false, // isCxxModule
        true   // isTurboModule (set to true if TurboModule is supported)
      )
      moduleInfos
    }
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList() // Add your ViewManagers here if any
  }
}
