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
  signature?.let { map.putString("signature", it) }
  campaignId?.let { map.putString("campaignId", it) }
  type?.let { map.putString("type", it) }
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
      val primMap = Arguments.createMap()
      primMap.putString("type", it.type)
      primMap.putString("fileName", it.fileName)
      primMap.putInt("fileSize", it.fileSize ?: 0)
      primMap.putString("fileUrl", it.fileUrl)
      primMap.putString("thumbnailUrl", it.thumbnailUrl)
      cv1Map.putMap("primary", primMap)
    }

    creativeV1.companions?.let { companions ->
      val companionsArr = Arguments.createArray()
      companions.forEach { companion ->
        val compMap = Arguments.createMap()
        compMap.putString("type", companion.type)
        compMap.putString("fileName", companion.fileName)
        compMap.putInt("fileSize", companion.fileSize ?: 0)
        compMap.putString("fileUrl", companion.fileUrl)
        compMap.putString("thumbnailUrl", companion.thumbnailUrl)
        companionsArr.pushMap(compMap)
      }
      cv1Map.putArray("companions", companionsArr)
    }

    creativesV1Arr.pushMap(cv1Map)
  }
  map.putArray("creativesV1", creativesV1Arr)

  displayOptions?.let { opt ->
    val opMap = Arguments.createMap()
    opMap.putBoolean("isResponsive", opt.isResponsive ?: false)
    opMap.putString("responsiveType", opt.responsiveType)

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

    opt.allowedFormats?.let { list ->
      val arr = Arguments.createArray()
      list.forEach { arr.pushString(it) }
      opMap.putArray("allowedFormats", arr)
    }

    map.putMap("displayOptions", opMap)
  }

  impressionRequirements?.let {
    val ir = Arguments.createMap()
    it.impressionType?.let { types ->
      val typesArr = Arguments.createArray()
      types.forEach { type -> typesArr.pushString(type) }
      ir.putArray("impressionType", typesArr)
    }
    ir.putInt("minViewDurationSeconds", it.minViewDurationSeconds ?: 0)
    map.putMap("impressionRequirements", ir)
  }

  return map
}
