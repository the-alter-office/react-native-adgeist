package com.adgeist.components

import android.util.Log
import android.widget.FrameLayout
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class AdPreviewViewManager : SimpleViewManager<FrameLayout>() {

    override fun getName(): String = AdPreviewViewManagerImpl.NAME

    override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
        return AdPreviewViewManagerImpl.createViewInstance(reactContext)
    }

    @ReactProp(name = "type")
    fun setType(view: FrameLayout, type: String?) {
        AdPreviewViewManagerImpl.setPreviewType(view, type)
    }

    @ReactProp(name = "media")
    fun setMedia(view: FrameLayout, media: String?) {
        AdPreviewViewManagerImpl.setPreviewMedia(view, media)
    }

    @ReactProp(name = "creativeUrl")
    fun setCreativeUrl(view: FrameLayout, creativeUrl: String?) {
        AdPreviewViewManagerImpl.setCreativeUrl(view, creativeUrl)
    }

    @ReactProp(name = "companionUrl")
    fun setCompanionUrl(view: FrameLayout, companionUrl: String?) {
        AdPreviewViewManagerImpl.setCompanionUrl(view, companionUrl)
    }

    @ReactProp(name = "title")
    fun setTitle(view: FrameLayout, title: String?) {
        AdPreviewViewManagerImpl.setTitle(view, title)
    }

    @ReactProp(name = "description")
    fun setDescription(view: FrameLayout, description: String?) {
        AdPreviewViewManagerImpl.setDescription(view, description)
    }

    @ReactProp(name = "ctaUrl")
    fun setCtaUrl(view: FrameLayout, ctaUrl: String?) {
        AdPreviewViewManagerImpl.setCtaUrl(view, ctaUrl)
    }

    @ReactProp(name = "deepLinkUrl")
    fun setDeepLinkUrl(view: FrameLayout, deepLinkUrl: String?) {
        AdPreviewViewManagerImpl.setDeepLinkUrl(view, deepLinkUrl)
    }

    @ReactProp(name = "isResponsive", defaultBoolean = true)
    fun setIsResponsive(view: FrameLayout, isResponsive: Boolean) {
        AdPreviewViewManagerImpl.setIsResponsive(view, isResponsive)
    }

    @ReactProp(name = "adSize")
    fun setAdSize(view: FrameLayout, adSizeMap: ReadableMap?) {
        AdPreviewViewManagerImpl.setAdSize(view, adSizeMap)
    }

    @ReactProp(name = "reserveSpace", defaultBoolean = false)
    fun setReserveSpace(view: FrameLayout, reserveSpace: Boolean) {
        AdPreviewViewManagerImpl.setReserveSpace(view, reserveSpace)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return listOf(
            AdPreviewViewManagerImpl.AD_EVENT_LISTENER,
            AdPreviewViewManagerImpl.AD_SIZE_CHANGED_LISTENER,
        ).associateWith { MapBuilder.of("registrationName", it) }
    }

    override fun getCommandsMap(): Map<String, Int> {
        return MapBuilder.of("loadAd", COMMAND_LOAD_AD)
    }

    override fun receiveCommand(root: FrameLayout, commandId: Int, args: ReadableArray?) {
        try {
            when (commandId) {
                COMMAND_LOAD_AD -> {
                    loadAd(root)
                }
                else -> {
                    Log.w("AdPreviewViewManager", "Unknown command received: $commandId")
                }
            }
        } catch (e: Exception) {
            Log.e("AdPreviewViewManager", "Error in receiveCommand: ${e.message}", e)
        }
    }

    fun loadAd(view: FrameLayout) {
        AdPreviewViewManagerImpl.loadAd(view)
    }

    override fun onDropViewInstance(view: FrameLayout) {
        super.onDropViewInstance(view)
        AdPreviewViewManagerImpl.destroyAd(view)
    }

    companion object {
        private const val COMMAND_LOAD_AD = 1
    }
}
