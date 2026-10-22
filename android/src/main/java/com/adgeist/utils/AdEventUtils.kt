package com.adgeist.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

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
