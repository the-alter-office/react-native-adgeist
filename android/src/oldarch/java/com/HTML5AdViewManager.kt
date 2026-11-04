package com.adgeist.components

import android.util.Log
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class HTML5AdViewManager : SimpleViewManager<ReactAdView>() {

    override fun getName(): String = HTML5AdViewManagerImpl.NAME

    override fun createViewInstance(reactContext: ThemedReactContext): ReactAdView {
        return HTML5AdViewManagerImpl.createViewInstance(reactContext)
    }

    @ReactProp(name = "adUnitID")
    fun setAdUnitID(view: ReactAdView, adUnitID: String?) {
        HTML5AdViewManagerImpl.setAdUnitID(view, adUnitID)
    }

    @ReactProp(name = "adIsResponsive", defaultBoolean = false)
    fun setAdIsResponsive(view: ReactAdView, adIsResponsive: Boolean) {
        HTML5AdViewManagerImpl.setAdIsResponsive(view, adIsResponsive)
    }

    @ReactProp(name = "adSize")
    fun setAdSize(view: ReactAdView, adSizeMap: ReadableMap?) {
        HTML5AdViewManagerImpl.setAdSize(view, adSizeMap)
    }

    @ReactProp(name = "reserveSpace", defaultBoolean = true)
    fun setReserveSpace(view: ReactAdView, reserveSpace: Boolean) {
        HTML5AdViewManagerImpl.setReserveSpace(view, reserveSpace)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return listOf(
          HTML5AdViewManagerImpl.AD_EVENT_LISTENER,
          HTML5AdViewManagerImpl.AD_SIZE_CHANGED_LISTENER,
        ).associateWith { MapBuilder.of("registrationName", it) }
    }

    override fun getCommandsMap(): Map<String, Int> {
        return MapBuilder.of(
            "loadAd", COMMAND_LOAD_AD,
            "destroy", COMMAND_DESTROY
        )
    }

    override fun receiveCommand(root: ReactAdView, commandId: Int, args: ReadableArray?) {
        try {
            when (commandId) {
                COMMAND_LOAD_AD -> {
                    loadAd(root)
                }
                COMMAND_DESTROY -> {
                    destroy(root)
                }
                else -> {
                    Log.w("HTML5AdViewManager", "Unknown command received: $commandId")
                }
            }
        } catch (e: Exception) {
            Log.e("HTML5AdViewManager", "Error in receiveCommand: ${e.message}", e)
        }
    }

    fun loadAd(view: ReactAdView) {
        HTML5AdViewManagerImpl.loadAd(view)
    }

    fun destroy(view: ReactAdView) {
        HTML5AdViewManagerImpl.destroyAd(view)
    }

    override fun onDropViewInstance(view: ReactAdView) {
        super.onDropViewInstance(view)
        HTML5AdViewManagerImpl.dropViewInstance(view)
    }

    companion object {
        private const val COMMAND_LOAD_AD = 1
        private const val COMMAND_DESTROY = 2
    }
}
