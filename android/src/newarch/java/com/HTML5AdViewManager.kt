package com.adgeist.components

import android.util.Log
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.HTML5AdNativeComponentManagerDelegate
import com.facebook.react.viewmanagers.HTML5AdNativeComponentManagerInterface

@ReactModule(name = HTML5AdViewManagerImpl.NAME)
class HTML5AdViewManager : SimpleViewManager<ReactAdView>(), HTML5AdNativeComponentManagerInterface<ReactAdView> {

    private val mDelegate: ViewManagerDelegate<ReactAdView> = HTML5AdNativeComponentManagerDelegate(this)

    override fun getDelegate(): ViewManagerDelegate<ReactAdView> {
        return mDelegate
    }

    override fun getName(): String = HTML5AdViewManagerImpl.NAME

    override fun createViewInstance(reactContext: ThemedReactContext): ReactAdView {
        return HTML5AdViewManagerImpl.createViewInstance(reactContext)
    }

    @ReactProp(name = "adUnitID")
    override fun setAdUnitID(view: ReactAdView, adUnitID: String?) {
        HTML5AdViewManagerImpl.setAdUnitID(view, adUnitID)
    }

    @ReactProp(name = "adIsResponsive", defaultBoolean = false)
    override fun setAdIsResponsive(view: ReactAdView, adIsResponsive: Boolean) {
        HTML5AdViewManagerImpl.setAdIsResponsive(view, adIsResponsive)
    }

    @ReactProp(name = "adSize")
    override fun setAdSize(view: ReactAdView, adSizeMap: ReadableMap?) {
        HTML5AdViewManagerImpl.setAdSize(view, adSizeMap)
    }

    @ReactProp(name = "reserveSpace", defaultBoolean = true)
    override fun setReserveSpace(view: ReactAdView, reserveSpace: Boolean) {
        HTML5AdViewManagerImpl.setReserveSpace(view, reserveSpace)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return listOf(
            HTML5AdViewManagerImpl.AD_EVENT_LISTENER,
            HTML5AdViewManagerImpl.AD_SIZE_CHANGED_LISTENER,
        ).associateWith { MapBuilder.of("registrationName", it) }
    }

    override fun loadAd(view: ReactAdView) {
        HTML5AdViewManagerImpl.loadAd(view)
    }

    override fun destroy(view: ReactAdView) {
        HTML5AdViewManagerImpl.destroyAd(view)
    }

    override fun onDropViewInstance(view: ReactAdView) {
        super.onDropViewInstance(view)
        HTML5AdViewManagerImpl.dropViewInstance(view)
    }
}
