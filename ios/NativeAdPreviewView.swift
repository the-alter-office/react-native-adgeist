import UIKit
import AdgeistKit
import React

// MARK: - Delegate Protocol (Objective-C compatible)
@objc public protocol NativeAdPreviewDelegate: NSObjectProtocol {
    @objc(onPreviewEvent:code:type:message:reason:) func onPreviewEvent(_ view: NativeAdPreviewView, code: String, type: String, message: String, reason: String?)
    @objc(onPreviewSizeChanged:width:height:) func onPreviewSizeChanged(_ view: NativeAdPreviewView, width: Double, height: Double)
}

// MARK: - Main Swift View (Exposed to Objective-C++)
@objc(NativeAdPreviewView)
@objcMembers
public class NativeAdPreviewView: UIView {

    // MARK: Public Props (accessible from .mm)
    @objc public var previewType: String = "banner"
    @objc public var previewMedia: String = "image"
    @objc public var creativeUrl: String?
    @objc public var companionUrl: String?
    @objc public var adTitle: String = ""
    @objc public var adDescription: String = ""
    @objc public var ctaUrl: String = "https://adgeist.ai"
    @objc public var deepLinkUrl: String?
    @objc public var isResponsive: Bool = true
    @objc public var adSize: NSDictionary?
    @objc public var reserveSpace: Bool = false

    // MARK: Events (Old Architecture)
    @objc public var onAdEvent: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdSizeChanged: ((_ body: [String: Any]) -> Void)?

    // MARK: Delegate (used to send events back to manager)
    @objc public weak var delegate: NativeAdPreviewDelegate?

    private var preview: AdViewPreview?

    private var hasLoaded = false

    public override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .clear
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        preview?.frame = bounds
    }

    @objc public override func didSetProps(_ changedProps: [String]) {
        reloadPreview()
    }

    @objc public func loadAd() {
        hasLoaded = true
        embedPreview()
        setNeedsLayout()
    }

    @objc public func reloadPreview() {
        guard hasLoaded else { return }
        embedPreview()
        setNeedsLayout()
    }

    @objc public func destroy() {
        hasLoaded = false
        cleanupPreview()
    }

    private func cleanupPreview() {
        preview?.onEvent = nil
        preview?.removeFromSuperview()
        preview = nil
    }

    private func embedPreview() {
        cleanupPreview()

        let dict = adSize as? [String: Any]

        let preview = AdViewPreview(
            type: AdPreviewType(rawValue: previewType) ?? .banner,
            creativeUrl: nonEmpty(creativeUrl),
            companionUrl: nonEmpty(companionUrl),
            media: AdPreviewMedia(rawValue: previewMedia) ?? .image,
            title: adTitle,
            description: adDescription,
            ctaUrl: nonEmpty(ctaUrl) ?? "https://adgeist.ai",
            deepLinkUrl: nonEmpty(deepLinkUrl),
            isResponsive: isResponsive,
            width: dimension(dict?["width"]),
            height: dimension(dict?["height"]),
            reserveSpace: reserveSpace
        )

        preview.frame = bounds
        preview.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        preview.onEvent = { [weak self, weak preview] event in
            DispatchQueue.main.async {
                guard let self = self, let preview = preview, preview === self.preview else { return }
                self.handle(event, from: preview)
            }
        }

        self.preview = preview
        addSubview(preview)
        preview.load()
    }

    private func handle(_ event: AdgeistEvent, from preview: AdViewPreview) {
        emitAdEvent(
            code: event.code,
            type: typeName(event.type),
            message: event.message,
            reason: event.data?["reason"]
        )

        guard event.type == .adLoaded else { return }

        let size = preview.intrinsicContentSize
        if size.width > 0 && size.height > 0 {
            onAdSizeChanged?(["width": Double(size.width), "height": Double(size.height)])
            delegate?.onPreviewSizeChanged(self, width: Double(size.width), height: Double(size.height))
        }
    }

    private func emitAdEvent(code: String, type: String, message: String, reason: String?) {
        let body: [String: Any] = [
            "code": code,
            "type": type,
            "message": message,
            "data": ["reason": reason ?? ""]
        ]

        onAdEvent?(body)
        delegate?.onPreviewEvent(self, code: code, type: type, message: message, reason: reason)
    }

    private func typeName(_ type: AdgeistEventType) -> String {
        switch type {
        case .adLoaded: return "AD_LOADED"
        case .adClicked: return "AD_CLICKED"
        case .adNoFill: return "AD_NO_FILL"
        case .adNetworkError: return "AD_NETWORK_ERROR"
        case .adWarning: return "AD_WARNING"
        @unknown default: return type.rawValue
        }
    }

    private func dimension(_ value: Any?) -> CGFloat? {
        guard let number = value as? NSNumber, number.doubleValue > 0 else { return nil }
        return CGFloat(number.doubleValue)
    }

    private func nonEmpty(_ value: String?) -> String? {
        guard let value = value, !value.isEmpty else { return nil }
        return value
    }
}
