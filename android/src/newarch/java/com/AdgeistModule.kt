package com.adgeist

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.adgeist.implementation.AdgeistModuleImpl

class AdgeistModule internal constructor(reactContext: ReactApplicationContext) : 
    NativeAdgeistSpec(reactContext) {

    private var implementation: AdgeistModuleImpl = AdgeistModuleImpl(reactContext)

    override fun getName(): String = AdgeistModuleImpl.NAME

    override fun fetchCreative(adSpaceId: String, publisherId: String, promise: Promise) {
        implementation.fetchCreative(adSpaceId, publisherId, promise)
    }

    override fun sendCreativeAnalytic(campaignId: String, adSpaceId: String, publisherId: String, eventType: String, promise: Promise) {
        implementation.sendCreativeAnalytic(campaignId, adSpaceId, publisherId, eventType, promise)
    }

}