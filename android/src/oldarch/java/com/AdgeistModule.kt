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
    fun initializeSdk(customDomain: String, promise: Promise) {
        implementation.initializeSdk(customDomain, promise)   
    }

    @ReactMethod
    fun fetchCreative(apiKey: String, origin: String, adSpaceId: String, publisherId: String, isTestEnvironment: Boolean, promise: Promise) {
        implementation.fetchCreative(apiKey, origin, adSpaceId, publisherId, isTestEnvironment, promise)
    }

    @ReactMethod
    fun sendCreativeAnalytic(campaignId: String, adSpaceId: String, publisherId: String, eventType: String, origin: String, apiKey: String, bidId: String, isTestEnvironment: Boolean , promise: Promise) {
        implementation.sendCreativeAnalytic(campaignId, adSpaceId, publisherId, eventType, origin, apiKey, bidId, isTestEnvironment, promise)
    }

}