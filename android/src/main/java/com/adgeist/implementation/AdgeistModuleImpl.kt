package com.adgeist.implementation

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.adgeistkit.AdgeistCore
import com.adgeistkit.CreativeDataModel
import com.adgeistkit.Campaign
import com.adgeistkit.Creative
import com.adgeistkit.BudgetSettings

class AdgeistModuleImpl internal constructor(private val context: ReactApplicationContext) {

  private val adgeistInstanceFromLibrary = AdgeistCore.initialize(context.applicationContext)
  private val getAd = adgeistInstanceFromLibrary.getCreative()
  private val postCreativeAnalytic = adgeistInstanceFromLibrary.postCreativeAnalytics()

  fun fetchCreative(adSpaceId: String, publisherId: String, promise: Promise) {
    getAd.fetchCreative(adSpaceId, publisherId) { adData ->
      if (adData != null) {
        promise.resolve(adData.toWritableMap())
      } else {
        promise.reject("NO_AD", "Ad data not available")
      }
    }
  }

  fun sendCreativeAnalytic(campaignId: String, adSpaceId: String, publisherId: String, eventType: String, promise: Promise) {
    postCreativeAnalytic.sendTrackingData(campaignId, adSpaceId, publisherId, eventType) { adData ->
      if (adData != null) {
        promise.resolve(adData)
      } else {
        promise.reject("NO_AD", "Couldn't find the campaign to update analytics")
      }
    }
  }

  companion object {
    const val NAME = "Adgeist"

  }
}

// Extension function to convert CreativeData to WritableMap
fun CreativeDataModel.toWritableMap(): WritableMap {
  val map = Arguments.createMap()
  map.putBoolean("success", success)
  map.putString("message", message)

  val dataMap = Arguments.createMap()
  data?.let { campaign ->
    dataMap.putString("_id", campaign._id)
    dataMap.putString("name", campaign.name)

    val creativeMap = Arguments.createMap()
    campaign.creative?.let { creative ->
      creativeMap.putString("title", creative.title)
      creativeMap.putString("description", creative.description)
      creativeMap.putString("fileUrl", creative.fileUrl)
      creativeMap.putString("ctaUrl", creative.ctaUrl)
      creativeMap.putString("type", creative.type)
      creativeMap.putString("fileName", creative.fileName)
      creativeMap.putString("createdAt", creative.createdAt)
      creativeMap.putString("updatedAt", creative.updatedAt)
    }
    dataMap.putMap("creative", creativeMap)

    val budgetMap = Arguments.createMap()
    campaign.budgetSettings?.let { budget ->
      budgetMap.putDouble("totalBudget", budget.totalBudget)
      budgetMap.putDouble("spentBudget", budget.spentBudget)
    }
    dataMap.putMap("budgetSettings", budgetMap)
  }

  map.putMap("data", dataMap)
  return map
}
