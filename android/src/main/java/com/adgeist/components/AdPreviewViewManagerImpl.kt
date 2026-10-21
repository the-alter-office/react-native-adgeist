package com.adgeist.components

import android.util.Log
import android.widget.FrameLayout
import com.adgeist.utils.WrapperEventCode
import com.adgeist.utils.buildAdEvent
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

object AdPreviewViewManagerImpl {
    const val NAME = "AdPreviewNativeComponent"
    private const val TAG = "AdPreviewViewManagerImpl"

    const val AD_EVENT_LISTENER = "onAdEvent"
    const val AD_SIZE_CHANGED_LISTENER = "onAdSizeChanged"

    fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
        return FrameLayout(reactContext)
    }

    fun setPreviewType(view: FrameLayout, type: String?) {
        // TODO: not implemented on Android
    }

    fun setPreviewMedia(view: FrameLayout, media: String?) {
        // TODO: not implemented on Android
    }

    fun setCreativeUrl(view: FrameLayout, creativeUrl: String?) {
        // TODO: not implemented on Android
    }

    fun setCompanionUrl(view: FrameLayout, companionUrl: String?) {
        // TODO: not implemented on Android
    }

    fun setTitle(view: FrameLayout, title: String?) {
        // TODO: not implemented on Android
    }

    fun setDescription(view: FrameLayout, description: String?) {
        // TODO: not implemented on Android
    }

    fun setCtaUrl(view: FrameLayout, ctaUrl: String?) {
        // TODO: not implemented on Android
    }

    fun setDeepLinkUrl(view: FrameLayout, deepLinkUrl: String?) {
        // TODO: not implemented on Android
    }

    fun setIsResponsive(view: FrameLayout, isResponsive: Boolean) {
        // TODO: not implemented on Android
    }

    fun setAdSize(view: FrameLayout, adSizeMap: ReadableMap?) {
        // TODO: not implemented on Android
    }

    fun setReserveSpace(view: FrameLayout, reserveSpace: Boolean) {
        // TODO: not implemented on Android
    }

    fun loadAd(view: FrameLayout) {
        val payload = buildAdEvent(WrapperEventCode.RWAW1, reason = null)

        view.post {
            sendEvent(view, AD_EVENT_LISTENER, payload)
        }
    }

    fun destroyAd(view: FrameLayout) {
        // TODO: not implemented on Android
    }

    private fun sendEvent(view: FrameLayout, eventName: String, params: WritableMap) {
        val reactContext = view.context as? ThemedReactContext

        if (reactContext == null) {
            Log.w(TAG, "Unable to send event $eventName: ThemedReactContext not found")
            return
        }

        try {
            reactContext
                .getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(view.id, eventName, params)
        } catch (e: Exception) {
            Log.e(TAG, "Error sending event $eventName", e)
        }
    }
}
