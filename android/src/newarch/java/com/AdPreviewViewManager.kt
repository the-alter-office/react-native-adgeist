package com.adgeist.components

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
class AdPreviewViewManager : SimpleViewManager<ReactAdPreviewView>(), AdPreviewNativeComponentManagerInterface<ReactAdPreviewView> {

    private val mDelegate: ViewManagerDelegate<ReactAdPreviewView> = AdPreviewNativeComponentManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<ReactAdPreviewView> {
        return mDelegate
    }

    override fun getName(): String = AdPreviewViewManagerImpl.NAME

    override fun createViewInstance(reactContext: ThemedReactContext): ReactAdPreviewView {
        return AdPreviewViewManagerImpl.createViewInstance(reactContext)
    }

    @ReactProp(name = "type")
    override fun setType(view: ReactAdPreviewView, type: String?) {
        AdPreviewViewManagerImpl.setPreviewType(view, type)
    }

    @ReactProp(name = "media")
    override fun setMedia(view: ReactAdPreviewView, media: String?) {
        AdPreviewViewManagerImpl.setPreviewMedia(view, media)
    }

    @ReactProp(name = "creativeUrl")
    override fun setCreativeUrl(view: ReactAdPreviewView, creativeUrl: String?) {
        AdPreviewViewManagerImpl.setCreativeUrl(view, creativeUrl)
    }

    @ReactProp(name = "companionUrl")
    override fun setCompanionUrl(view: ReactAdPreviewView, companionUrl: String?) {
        AdPreviewViewManagerImpl.setCompanionUrl(view, companionUrl)
    }

    @ReactProp(name = "title")
    override fun setTitle(view: ReactAdPreviewView, title: String?) {
        AdPreviewViewManagerImpl.setTitle(view, title)
    }

    @ReactProp(name = "description")
    override fun setDescription(view: ReactAdPreviewView, description: String?) {
        AdPreviewViewManagerImpl.setDescription(view, description)
    }

    @ReactProp(name = "ctaUrl")
    override fun setCtaUrl(view: ReactAdPreviewView, ctaUrl: String?) {
        AdPreviewViewManagerImpl.setCtaUrl(view, ctaUrl)
    }

    @ReactProp(name = "deepLinkUrl")
    override fun setDeepLinkUrl(view: ReactAdPreviewView, deepLinkUrl: String?) {
        AdPreviewViewManagerImpl.setDeepLinkUrl(view, deepLinkUrl)
    }

    @ReactProp(name = "isResponsive", defaultBoolean = true)
    override fun setIsResponsive(view: ReactAdPreviewView, isResponsive: Boolean) {
        AdPreviewViewManagerImpl.setIsResponsive(view, isResponsive)
    }

    @ReactProp(name = "adSize")
    override fun setAdSize(view: ReactAdPreviewView, adSizeMap: ReadableMap?) {
        AdPreviewViewManagerImpl.setAdSize(view, adSizeMap)
    }

    @ReactProp(name = "reserveSpace", defaultBoolean = false)
    override fun setReserveSpace(view: ReactAdPreviewView, reserveSpace: Boolean) {
        AdPreviewViewManagerImpl.setReserveSpace(view, reserveSpace)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return listOf(
            AdPreviewViewManagerImpl.AD_EVENT_LISTENER,
            AdPreviewViewManagerImpl.AD_SIZE_CHANGED_LISTENER,
        ).associateWith { MapBuilder.of("registrationName", it) }
    }

    override fun loadAd(view: ReactAdPreviewView) {
        AdPreviewViewManagerImpl.loadAd(view)
    }

    override fun onDropViewInstance(view: ReactAdPreviewView) {
        super.onDropViewInstance(view)
        AdPreviewViewManagerImpl.destroyAd(view)
    }
}
