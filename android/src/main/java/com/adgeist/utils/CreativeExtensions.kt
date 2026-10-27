package com.adgeist.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.adgeistkit.data.models.*

fun FixedAdResponse.toWritableMap(): WritableMap {
  val map = Arguments.createMap()

  expiresAt?.let { map.putString("expiresAt", it) }
  map.putString("metaData", metaData)
  map.putString("id", id)
  generatedAt?.let { map.putString("generatedAt", it) }
  campaignId?.let { map.putString("campaignId", it) }
  type?.let { map.putString("type", it) }
  map.putString("adSpaceType", adSpaceType.name.lowercase())
  loadType?.let { map.putString("loadType", it) }
  frontendCacheDurationSeconds?.let { map.putInt("frontendCacheDurationSeconds", it) }

  advertiser?.let {
    val advMap = Arguments.createMap()
    advMap.putString("id", it.id)
    advMap.putString("name", it.name)
    advMap.putString("logoUrl", it.logoUrl)
    map.putMap("advertiser", advMap)
  }

  campaignValidity?.let {
    val cvMap = Arguments.createMap()
    cvMap.putString("startTime", it.startTime)
    cvMap.putString("endTime", it.endTime)
    map.putMap("campaignValidity", cvMap)
  }

  val creativesV1Arr = Arguments.createArray()
  creativesV1.forEach { creativeV1 ->
    val cv1Map = Arguments.createMap()
    cv1Map.putString("title", creativeV1.title)
    cv1Map.putString("description", creativeV1.description)
    cv1Map.putString("ctaUrl", creativeV1.ctaUrl)

    creativeV1.primary?.let {
      cv1Map.putMap("primary", it.toWritableMap())
    }

    creativeV1.companions?.let { companions ->
      val companionsArr = Arguments.createArray()
      companions.forEach { companion ->
        companionsArr.pushMap(companion.toWritableMap())
      }
      cv1Map.putArray("companions", companionsArr)
    }

    creativesV1Arr.pushMap(cv1Map)
  }
  map.putArray("creativesV1", creativesV1Arr)

  displayOptions?.let { opt ->
    val opMap = Arguments.createMap()
    opMap.putBoolean("isResponsive", opt.isResponsive ?: false)
    opt.responsiveType?.let { opMap.putString("responsiveType", it) }

    opt.dimensions?.let {
      val dim = Arguments.createMap()
      dim.putInt("height", it.height ?: 0)
      dim.putInt("width", it.width ?: 0)
      opMap.putMap("dimensions", dim)
    }

    opt.styleOptions?.let {
      val st = Arguments.createMap()
      st.putString("fontColor", it.fontColor)
      st.putString("fontFamily", it.fontFamily)
      opMap.putMap("styleOptions", st)
    }

    opt.primaryFormats?.let { list ->
      val arr = Arguments.createArray()
      list.forEach { arr.pushString(it) }
      opMap.putArray("primaryFormats", arr)
    }

    opt.companionFormats?.let { list ->
      val arr = Arguments.createArray()
      list.forEach { arr.pushString(it) }
      opMap.putArray("companionFormats", arr)
    }

    map.putMap("displayOptions", opMap)
  }

  return map
}

private fun MediaItem.toWritableMap(): WritableMap {
  val map = Arguments.createMap()
  map.putString("type", type)
  map.putString("fileName", fileName)
  map.putInt("fileSize", fileSize ?: 0)
  map.putString("fileUrl", fileUrl)
  map.putString("thumbnailUrl", thumbnailUrl)
  return map
}
