package com.adgeist.adview

import android.content.res.Resources
import android.util.Log
import android.view.ViewGroup
import androidx.annotation.RequiresPermission
import com.adgeistkit.ads.AdView
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

@ReactModule(name = AdViewManagerImpl.NAME)
class AdViewManager : SimpleViewManager<AdView>() {

    override fun getName(): String = AdViewManagerImpl.NAME

    override fun createViewInstance(reactContext: ThemedReactContext): AdView {
        return AdViewManagerImpl.createViewInstance(reactContext)
    }

    @ReactProp(name = "adUnitId")
    fun setAdUnitId(view: AdView, adUnitId: String?) {
        AdViewManagerImpl.setAdUnitId(view, adUnitId)
    }

    @ReactProp(name = "adSize")
    fun setAdSize(view: AdView, adSizeMap: ReadableMap?) {
        AdViewManagerImpl.setAdSize(view, adSizeMap)
    }

    @ReactProp(name = "adType")
    fun setAdType(view: AdView, adType: String?) {
        AdViewManagerImpl.setAdType(view, adType)
    }

    @ReactProp(name = "customOrigin")
    fun setCustomOrigin(view: AdView, customOrigin: String?) {
        AdViewManagerImpl.setCustomOrigin(view, customOrigin)
    }

    override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
        return MapBuilder.of(
            AdViewManagerImpl.EVENT_AD_LOADED, MapBuilder.of("registrationName", AdViewManagerImpl.EVENT_AD_LOADED),
            AdViewManagerImpl.EVENT_AD_FAILED_TO_LOAD, MapBuilder.of("registrationName", AdViewManagerImpl.EVENT_AD_FAILED_TO_LOAD),
            AdViewManagerImpl.EVENT_AD_OPENED, MapBuilder.of("registrationName", AdViewManagerImpl.EVENT_AD_OPENED),
            AdViewManagerImpl.EVENT_AD_CLOSED, MapBuilder.of("registrationName", AdViewManagerImpl.EVENT_AD_CLOSED),
            AdViewManagerImpl.EVENT_AD_CLICKED, MapBuilder.of("registrationName", AdViewManagerImpl.EVENT_AD_CLICKED)
        )
    }

    @RequiresPermission("android.permission.INTERNET")
    override fun receiveCommand(view: AdView, commandId: String, args: ReadableArray?) {
        when (commandId) {
            "loadAd" -> {
                if (args != null && args.size() > 0) {
                    val adRequestMap = args.getMap(0)
                    AdViewManagerImpl.loadAd(view, adRequestMap)
                } else {
                    AdViewManagerImpl.loadAd(view, null)
                }
            }
            "destroy" -> {
                AdViewManagerImpl.destroyAd(view)
            }
        }
    }

    override fun onDropViewInstance(view: AdView) {
        super.onDropViewInstance(view)
        AdViewManagerImpl.destroyAd(view)
    }
}
