package com.adgeist.utils

import android.util.Log
import android.view.View
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

enum class WrapperEventCode(val type: String, val message: String) {
    RWAE1(
        type = "AD_INTERNAL_ERROR",
        message = "Ad failed to load: starting the ad request threw an exception"
    )
}

fun buildAdEvent(
    code: String,
    type: String,
    message: String,
    reason: String?
): WritableMap = Arguments.createMap().apply {
    putString("code", code)
    putString("type", type)
    putString("message", message)
    putMap("data", Arguments.createMap().apply {
        putString("reason", reason ?: "")
    })
}

fun buildAdEvent(code: WrapperEventCode, reason: String?): WritableMap =
    buildAdEvent(code.name, code.type, code.message, reason)

fun buildAdEvent(event: Map<String, Any?>): WritableMap =
    buildAdEvent(
        code = event["code"] as? String ?: "",
        type = event["type"] as? String ?: "",
        message = event["message"] as? String ?: "",
        reason = (event["data"] as? Map<*, *>)?.get("reason") as? String
    )

fun buildAdSizeEvent(widthDp: Int, heightDp: Int): WritableMap = Arguments.createMap().apply {
    putDouble("width", widthDp.toDouble())
    putDouble("height", heightDp.toDouble())
}

fun ThemedReactContext.sendViewEvent(view: View, eventName: String, params: WritableMap) {
    try {
        getJSModule(RCTEventEmitter::class.java).receiveEvent(view.id, eventName, params)
    } catch (e: Exception) {
        Log.e("AdEventUtils", "Error sending event $eventName", e)
    }
}
