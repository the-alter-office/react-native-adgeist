package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.adgeist.implementation.AdgeistModuleImpl

class AdgeistModule internal constructor(reactContext: ReactApplicationContext) : 
    NativeAdgeistSpec(reactContext) {

    private var implementation: AdgeistModuleImpl = AdgeistModuleImpl(reactContext)

    override fun getName(): String = AdgeistModuleImpl.NAME

    override fun fetchCreative(apiKey: String, origin: String, adSpaceId: String, publisherId: String, isTestEnvironment: Boolean, promise: Promise) {
        implementation.fetchCreative(apiKey, origin, adSpaceId, publisherId, isTestEnvironment, promise)
    }

    override fun sendCreativeAnalytic(campaignId: String, adSpaceId: String, publisherId: String, eventType: String, origin: String, apiKey: String, bidId: String, isTestEnvironment: Boolean , promise: Promise) {
        implementation.sendCreativeAnalytic(campaignId, adSpaceId, publisherId, eventType, origin, apiKey, bidId, isTestEnvironment, promise)
    }

}