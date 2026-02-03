package com.adgeist.components

import android.util.Log
import androidx.annotation.RequiresPermission
import com.adgeistkit.ads.AdView
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class HTML5AdViewManager : SimpleViewManager<AdView>() {

    override fun getName(): String = HTML5AdViewManagerImpl.NAME

    override fun createViewInstance(reactContext: ThemedReactContext): AdView {
        return HTML5AdViewManagerImpl.createViewInstance(reactContext)
    }

    @ReactProp(name = "adUnitID")
    fun setAdUnitID(view: AdView, adUnitID: String?) {
        HTML5AdViewManagerImpl.setAdUnitID(view, adUnitID)
    }

    @ReactProp(name = "adIsResponsive", defaultBoolean = false)
    fun setAdIsResponsive(view: AdView, adIsResponsive: Boolean) {
        HTML5AdViewManagerImpl.setAdIsResponsive(view, adIsResponsive)
    }

    @ReactProp(name = "adSize")
    fun setAdSize(view: AdView, adSizeMap: ReadableMap?) {
        HTML5AdViewManagerImpl.setAdSize(view, adSizeMap)
    }

    @ReactProp(name = "adType")
    fun setAdType(view: AdView, adType: String?) {
        HTML5AdViewManagerImpl.setAdType(view, adType)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.of(
            HTML5AdViewManagerImpl.EVENT_AD_LOADED, MapBuilder.of("registrationName", HTML5AdViewManagerImpl.EVENT_AD_LOADED),
            HTML5AdViewManagerImpl.EVENT_AD_FAILED_TO_LOAD, MapBuilder.of("registrationName", HTML5AdViewManagerImpl.EVENT_AD_FAILED_TO_LOAD),
            HTML5AdViewManagerImpl.EVENT_AD_OPENED, MapBuilder.of("registrationName", HTML5AdViewManagerImpl.EVENT_AD_OPENED),
            HTML5AdViewManagerImpl.EVENT_AD_CLOSED, MapBuilder.of("registrationName", HTML5AdViewManagerImpl.EVENT_AD_CLOSED),
            HTML5AdViewManagerImpl.EVENT_AD_CLICKED, MapBuilder.of("registrationName", HTML5AdViewManagerImpl.EVENT_AD_CLICKED)
        )
    }

    override fun getCommandsMap(): Map<String, Int> {
        return MapBuilder.of(
            "loadAd", COMMAND_LOAD_AD,
            "destroy", COMMAND_DESTROY
        )
    }

    override fun receiveCommand(root: AdView, commandId: Int, args: ReadableArray?) {
        try {
            when (commandId) {
                COMMAND_LOAD_AD -> {
                    val isTestMode = args?.getBoolean(0) ?: false
                    loadAd(root, isTestMode)
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

    @RequiresPermission("android.permission.INTERNET")
    fun loadAd(view: AdView, isTestMode: Boolean) {
        HTML5AdViewManagerImpl.loadAd(view, isTestMode)
    }

    fun destroy(view: AdView) {
        HTML5AdViewManagerImpl.destroyAd(view)
    }

    override fun onDropViewInstance(view: AdView) {
        super.onDropViewInstance(view)
        HTML5AdViewManagerImpl.destroyAd(view)
    }

    companion object {
        private const val COMMAND_LOAD_AD = 1
        private const val COMMAND_DESTROY = 2
    }
}
