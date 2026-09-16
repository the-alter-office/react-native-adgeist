package com.adgeist.components

import android.util.Log
import android.view.View
import androidx.annotation.RequiresPermission
import com.adgeistkit.ads.AdListener
import com.adgeistkit.ads.AdSize
import com.adgeistkit.ads.AdType
import com.adgeistkit.ads.AdView
import com.adgeistkit.request.AdRequest
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

object HTML5AdViewManagerImpl {
    const val NAME = "HTML5AdNativeComponent"
    private const val TAG = "HTML5AdViewManagerImpl"

    const val EVENT_AD_LOADED = "onAdLoaded"
    const val EVENT_AD_FAILED_TO_LOAD = "onAdFailedToLoad"
    const val EVENT_AD_OPENED = "onAdOpened"
    const val EVENT_AD_CLOSED = "onAdClosed"
    const val EVENT_AD_CLICKED = "onAdClicked"

    private val viewContextMap = mutableMapOf<Int, ThemedReactContext>()
    private val viewAdSizeMap = mutableMapOf<Int, AdSize>()
    private val viewReserveSpaceMap = mutableMapOf<Int, Boolean>()

    fun createViewInstance(reactContext: ThemedReactContext): AdView {
        Log.d(TAG, "Creating AdView with ThemedReactContext: ${reactContext.hashCode()}")
        val adView = AdView(reactContext)
        // react-native-screens destroys/recreates the host fragment whenever a
        // screen is covered, so fragment onDestroy is not a teardown signal
        // here; RN drives teardown via onDropViewInstance instead
        adView.watchFragmentLifecycle = false
        viewContextMap[System.identityHashCode(adView)] = reactContext
        Log.d(TAG, "AdView created with hash: ${System.identityHashCode(adView)} and context hash: ${reactContext.hashCode()}")
        return adView
    }

    fun setAdUnitID(view: AdView, adUnitID: String?) {
        if (adUnitID != null) {
            view.adUnitId = adUnitID
        }
    }

    fun setAdIsResponsive(view: AdView, adIsResponsive: Boolean) {
        view.adIsResponsive = adIsResponsive
    }

    fun setAdSize(view: AdView, adSizeMap: ReadableMap?) {
        if (adSizeMap != null) {
            try {
                val width = adSizeMap.getInt("width")
                val height = adSizeMap.getInt("height")

                val adSize = AdSize(width, height)

                viewAdSizeMap[System.identityHashCode(view)] = adSize
                view.setAdDimension(adSize)
                applyReservedSpace(view)
            } catch (e: Exception) {
                Log.e(TAG, "Error setting ad size", e)
            }
        }
    }

    fun setReserveSpace(view: AdView, reserveSpace: Boolean) {
        viewReserveSpaceMap[System.identityHashCode(view)] = reserveSpace
        applyReservedSpace(view)
    }

    private fun applyReservedSpace(view: AdView) {
        val key = System.identityHashCode(view)
        val adSize = viewAdSizeMap[key]
        val reserveSpace = viewReserveSpaceMap[key] == true

        if (!reserveSpace || adSize == null || adSize.width <= 0 || adSize.height <= 0) {
            view.minimumWidth = 0
            view.minimumHeight = 0
            return
        }

        val density = view.resources.displayMetrics.density
        view.minimumWidth = (adSize.width * density).toInt()
        view.minimumHeight = (adSize.height * density).toInt()
    }

    fun setAdType(view: AdView, adType: String?) {
        val typeToSet = adType ?: "BANNER"
        try {
            view.adType = AdType.valueOf(typeToSet)
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "Invalid ad type: $typeToSet. Must be BANNER, DISPLAY, or COMPANION", e)
            view.adType = AdType.BANNER
        }
    }

    @RequiresPermission("android.permission.INTERNET")
    fun loadAd(view: AdView) {
        try {
            val adRequest = AdRequest.Builder().build()

            view.setAdListener(object : AdListener() {
                override fun onAdLoaded() {
                  view.post {
                    sendEvent(view, EVENT_AD_LOADED, Arguments.createMap())
                    measureAndLayout(view)
                  }
                }

                override fun onAdFailedToLoad(error: String) {
                    val event = Arguments.createMap().apply {
                        putString("error", error)
                    }
                    sendEvent(view, EVENT_AD_FAILED_TO_LOAD, event)
                }

                override fun onAdOpened() {
                    sendEvent(view, EVENT_AD_OPENED, Arguments.createMap())
                }

                override fun onAdClosed() {
                    sendEvent(view, EVENT_AD_CLOSED, Arguments.createMap())
                }

                override fun onAdClicked() {
                    sendEvent(view, EVENT_AD_CLICKED, Arguments.createMap())
                }
            })

            view.loadAd(adRequest)
        } catch (e: Exception) {
            val event = Arguments.createMap().apply {
                putString("error", e.message ?: "Unknown error")
            }
            sendEvent(view, EVENT_AD_FAILED_TO_LOAD, event)
        }
    }

    fun destroyAd(view: AdView) {
        try {
            view.destroy()
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying ad view", e)
        } finally {
            // Clean up the context reference
            val key = System.identityHashCode(view)
            viewContextMap.remove(key)
            viewAdSizeMap.remove(key)
            viewReserveSpaceMap.remove(key)
        }
    }

    private fun measureAndLayout(view: AdView) {
        view.measure(
            View.MeasureSpec.makeMeasureSpec(view.width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(view.height, View.MeasureSpec.EXACTLY)
        )
        view.layout(view.left, view.top, view.right, view.bottom)
    }

    private fun sendEvent(view: AdView, eventName: String, params: WritableMap) {
        val reactContext = viewContextMap[System.identityHashCode(view)]
        if (reactContext != null) {
            try {
                reactContext
                    .getJSModule(RCTEventEmitter::class.java)
                    .receiveEvent(view.id, eventName, params)
            } catch (e: Exception) {
                Log.e(TAG, "Error sending event $eventName", e)
            }
        } else {
            Log.w(TAG, "Unable to send event $eventName: ThemedReactContext not found or view already destroyed")
        }
    }
}
