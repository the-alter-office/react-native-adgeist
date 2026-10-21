package com.adgeist.components

import android.widget.FrameLayout
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.AdPreviewNativeComponentManagerDelegate
import com.facebook.react.viewmanagers.AdPreviewNativeComponentManagerInterface

@ReactModule(name = AdPreviewViewManagerImpl.NAME)
class AdPreviewViewManager : SimpleViewManager<FrameLayout>(), AdPreviewNativeComponentManagerInterface<FrameLayout> {

    private val mDelegate: ViewManagerDelegate<FrameLayout> = AdPreviewNativeComponentManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<FrameLayout> {
        return mDelegate
    }

    override fun getName(): String = AdPreviewViewManagerImpl.NAME

    override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
        return AdPreviewViewManagerImpl.createViewInstance(reactContext)
    }

    @ReactProp(name = "type")
    override fun setType(view: FrameLayout, type: String?) {
        AdPreviewViewManagerImpl.setPreviewType(view, type)
    }

    @ReactProp(name = "media")
    override fun setMedia(view: FrameLayout, media: String?) {
        AdPreviewViewManagerImpl.setPreviewMedia(view, media)
    }

    @ReactProp(name = "creativeUrl")
    override fun setCreativeUrl(view: FrameLayout, creativeUrl: String?) {
        AdPreviewViewManagerImpl.setCreativeUrl(view, creativeUrl)
    }

    @ReactProp(name = "companionUrl")
    override fun setCompanionUrl(view: FrameLayout, companionUrl: String?) {
        AdPreviewViewManagerImpl.setCompanionUrl(view, companionUrl)
    }

    @ReactProp(name = "title")
    override fun setTitle(view: FrameLayout, title: String?) {
        AdPreviewViewManagerImpl.setTitle(view, title)
    }

    @ReactProp(name = "description")
    override fun setDescription(view: FrameLayout, description: String?) {
        AdPreviewViewManagerImpl.setDescription(view, description)
    }

    @ReactProp(name = "ctaUrl")
    override fun setCtaUrl(view: FrameLayout, ctaUrl: String?) {
        AdPreviewViewManagerImpl.setCtaUrl(view, ctaUrl)
    }

    @ReactProp(name = "deepLinkUrl")
    override fun setDeepLinkUrl(view: FrameLayout, deepLinkUrl: String?) {
        AdPreviewViewManagerImpl.setDeepLinkUrl(view, deepLinkUrl)
    }

    @ReactProp(name = "isResponsive", defaultBoolean = true)
    override fun setIsResponsive(view: FrameLayout, isResponsive: Boolean) {
        AdPreviewViewManagerImpl.setIsResponsive(view, isResponsive)
    }

    @ReactProp(name = "adSize")
    override fun setAdSize(view: FrameLayout, adSizeMap: ReadableMap?) {
        AdPreviewViewManagerImpl.setAdSize(view, adSizeMap)
    }

    @ReactProp(name = "reserveSpace", defaultBoolean = false)
    override fun setReserveSpace(view: FrameLayout, reserveSpace: Boolean) {
        AdPreviewViewManagerImpl.setReserveSpace(view, reserveSpace)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return listOf(
            AdPreviewViewManagerImpl.AD_EVENT_LISTENER,
            AdPreviewViewManagerImpl.AD_SIZE_CHANGED_LISTENER,
        ).associateWith { MapBuilder.of("registrationName", it) }
    }

    override fun loadAd(view: FrameLayout) {
        AdPreviewViewManagerImpl.loadAd(view)
    }

    override fun onDropViewInstance(view: FrameLayout) {
        super.onDropViewInstance(view)
        AdPreviewViewManagerImpl.destroyAd(view)
    }
}
