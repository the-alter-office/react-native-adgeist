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

    private var preview: UIView?

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
        guard let preview = preview else { return }
        self.preview = nil
        AdgeistEmbedder.shared.destroy(preview)
    }

    private func embedPreview() {
        cleanupPreview()

        let preview = AdgeistEmbedder.shared.makePreviewView(
            options: previewOptions(),
            onEvent: { [weak self] event in
                self?.emitAdEvent(event)
            },
            onSizeResolved: { [weak self] size in
                self?.emitAdSize(size)
            }
        )
        preview.frame = bounds
        preview.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        self.preview = preview
        addSubview(preview)
        AdgeistEmbedder.shared.load(preview)
    }

    private func previewOptions() -> [String: Any] {
        var options: [String: Any] = [
            "type": previewType,
            "media": previewMedia,
            "creativeUrl": creativeUrl ?? "",
            "companionUrl": companionUrl ?? "",
            "title": adTitle,
            "description": adDescription,
            "ctaUrl": ctaUrl,
            "deepLinkUrl": deepLinkUrl ?? "",
            "isResponsive": isResponsive,
            "reserveSpace": reserveSpace
        ]
        let dict = adSize as? [String: Any]
        if let width = dimension(dict?["width"]) {
            options["width"] = width
        }
        if let height = dimension(dict?["height"]) {
            options["height"] = height
        }
        return options
    }

    private func emitAdEvent(_ event: [String: Any]) {
        let code = event["code"] as? String ?? ""
        let type = event["type"] as? String ?? ""
        let message = event["message"] as? String ?? ""
        let reason = (event["data"] as? [String: Any])?["reason"] as? String
        let body: [String: Any] = [
            "code": code,
            "type": type,
            "message": message,
            "data": ["reason": reason ?? ""]
        ]

        onAdEvent?(body)
        delegate?.onPreviewEvent(self, code: code, type: type, message: message, reason: reason)
    }

    private func emitAdSize(_ size: CGSize) {
        onAdSizeChanged?(["width": Double(size.width), "height": Double(size.height)])
        delegate?.onPreviewSizeChanged(self, width: Double(size.width), height: Double(size.height))
    }

    private func dimension(_ value: Any?) -> NSNumber? {
        guard let number = value as? NSNumber, number.doubleValue > 0 else { return nil }
        return number
    }
}
