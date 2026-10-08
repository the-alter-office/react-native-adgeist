package com.adgeist.components

import android.util.Log
import androidx.annotation.RequiresPermission
import com.adgeistkit.ads.AdListener
import com.adgeistkit.ads.AdSize
import com.adgeistkit.ads.AdView
import com.adgeistkit.ads.AdgeistEvent
import com.adgeistkit.request.AdRequest
import com.adgeistkit.utilities.AdgeistEmbedderApi
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

object HTML5AdViewManagerImpl {
    const val NAME = "HTML5AdNativeComponent"
    private const val TAG = "HTML5AdViewManagerImpl"

    const val AD_EVENT_LISTENER = "onAdEvent"
    const val AD_SIZE_CHANGED_LISTENER = "onAdSizeChanged"

    private val viewContextMap = mutableMapOf<Int, ThemedReactContext>()

    @OptIn(AdgeistEmbedderApi::class)
    fun createViewInstance(reactContext: ThemedReactContext): AdView {
        Log.d(TAG, "Creating AdView with ThemedReactContext: ${reactContext.hashCode()}")
        val adView = ReactAdView(reactContext)
        // react-native-screens destroys/recreates the host fragment whenever a
        // screen is covered, so fragment onDestroy is not a teardown signal
        // here; RN drives teardown via onDropViewInstance instead
        adView.watchFragmentLifecycle = false
        adView.isFrameworkHosted = true
        adView.setAdListener(createAdListener(adView))
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
        if (adSizeMap == null) return

        try {
            val width = adSizeMap.getDimension("width")
            val height = adSizeMap.getDimension("height")

            val adSize = when {
                width > 0 && height > 0 -> AdSize(width, height)
                width > 0 -> AdSize.width(width)
                height > 0 -> AdSize.height(height)
                else -> return
            }

            view.setAdDimension(adSize)
        } catch (e: Exception) {
            Log.e(TAG, "Error setting ad size", e)
        }
    }

    fun setReserveSpace(view: AdView, reserveSpace: Boolean) {
        view.reserveSpace = reserveSpace
    }

    @OptIn(AdgeistEmbedderApi::class)
    private fun createAdListener(view: AdView): AdListener = object : AdListener() {
        override fun onAdEvent(event: AdgeistEvent) {
            val payload = Arguments.createMap().apply {
                putString("code", event.code.name)
                putString("type", event.type.name)
                putString("message", event.message)
                putMap("data", Arguments.createMap().apply {
                    putString("reason", event.data?.reason ?: "")
                })
            }

            view.post {
                sendEvent(view, AD_EVENT_LISTENER, payload)
            }
        }

        override fun onAdSizeResolved(adSize: AdSize) {
            val event = Arguments.createMap().apply {
                putDouble("width", adSize.width.toDouble())
                putDouble("height", adSize.height.toDouble())
            }
            sendEvent(view, AD_SIZE_CHANGED_LISTENER, event)
        }
    }

    @RequiresPermission("android.permission.INTERNET")
    fun loadAd(view: AdView) {
        try {
            val adRequest = AdRequest.Builder().build()

            view.loadAd(adRequest)
        } catch (_: Exception) {
        }
    }

    fun destroyAd(view: AdView) {
        try {
            view.destroyAd()
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying ad view", e)
        } finally {
            // Clean up the context reference
            viewContextMap.remove(System.identityHashCode(view))
        }
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

    private fun ReadableMap.getDimension(key: String): Int =
        if (hasKey(key) && !isNull(key)) getDouble(key).toInt() else 0
}
