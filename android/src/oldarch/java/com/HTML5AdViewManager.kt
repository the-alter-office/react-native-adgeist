package com.adgeist.components

import com.adgeistkit.ads.AdView
import com.facebook.react.bridge.ReadableMap
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

    @RequiresPermission("android.permission.INTERNET")
    fun loadAd(view: AdView, args: ReadableArray?) {
        val isTestMode = if (args != null && args.size() > 0) args.getBoolean(0) else false
        HTML5AdViewManagerImpl.loadAd(view, isTestMode)
    }

    override fun destroy(view: AdView) {
        HTML5AdViewManagerImpl.destroyAd(view)
    }

    override fun onDropViewInstance(view: AdView) {
        super.onDropViewInstance(view)
        HTML5AdViewManagerImpl.destroyAd(view)
    }
}
