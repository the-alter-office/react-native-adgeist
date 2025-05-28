package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.adgeist.implementation.AdgeistModuleImpl

class AdgeistModule internal constructor(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {

    private var implementation: AdgeistModuleImpl = AdgeistModuleImpl(reactContext)

    override fun getName(): String = AdgeistModuleImpl.NAME

    @ReactMethod
    fun fetchCreative(adSpaceId: String, publisherId: String, promise: Promise) {
        implementation.fetchCreative(adSpaceId, publisherId, promise)
    }

    @ReactMethod
    fun sendCreativeAnalytic(campaignId: String, adSpaceId: String, publisherId: String, eventType: String, promise: Promise) {
        implementation.sendCreativeAnalytic(campaignId, adSpaceId, publisherId, eventType, promise)
    }

}