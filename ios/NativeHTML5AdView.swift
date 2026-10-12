import UIKit
import AdgeistKit
import React

// MARK: - Delegate Protocol (Objective-C compatible)
@objc public protocol NativeHTML5AdDelegate: NSObjectProtocol {
    @objc(onAdEvent:code:type:message:reason:) func onAdEvent(_ view: NativeHTML5AdView, code: String, type: String, message: String, reason: String?)
    @objc(onAdSizeChanged:width:height:) func onAdSizeChanged(_ view: NativeHTML5AdView, width: Double, height: Double)
}

// MARK: - Main Swift View (Exposed to Objective-C++)
@objc(NativeHTML5AdView)
@objcMembers
public class NativeHTML5AdView: UIView {

    // MARK: Public Props (accessible from .mm)
    @objc public var adUnitID: String?
    @objc public var adSize: NSDictionary?
    @objc public var adIsResponsive: Bool = false
    @objc public var reserveSpace: Bool = true

    // MARK: Events (Old Architecture)
    @objc public var onAdEvent: ((_ body: [String: Any]) -> Void)?
    @objc public var onAdSizeChanged: ((_ body: [String: Any]) -> Void)?

    // MARK: Delegate (used to send events back to manager)
    @objc public weak var delegate: NativeHTML5AdDelegate?

    private var adView: AdView?

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
        adView?.frame = bounds
    }

    @objc public func triggerViewWillAppear() {}

    @objc public func reloadAd() {
        cleanupAdView()
        embedAdView()
        setNeedsLayout()
    }

    @objc public func loadAd() {
        reloadAd()
    }

    @objc public func destroy() {
        cleanupAdView()
    }

    private func cleanupAdView() {
        adView?.onEvent = nil
        adView?.removeFromSuperview()
        adView = nil
    }

    private func embedAdView() {
        guard let adUnitID = adUnitID, !adUnitID.isEmpty else {
            emitAdEvent(code: "AW2", type: "AD_WARNING", message: "Ad unit ID is null or empty", reason: nil)
            return
        }

        let dict = adSize as? [String: Any]
        let width = adIsResponsive ? nil : dimension(dict?["width"])
        let height = dimension(dict?["height"])

        let adView = AdView(adUnitId: adUnitID, width: width, height: height, reserveSpace: reserveSpace)
        adView.frame = bounds
        adView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        adView.onEvent = { [weak self, weak adView] event in
            DispatchQueue.main.async {
                guard let self = self, let adView = adView, adView === self.adView else { return }
                self.handle(event, from: adView)
            }
        }

        self.adView = adView
        addSubview(adView)
        adView.load()
    }

    private func handle(_ event: AdgeistEvent, from adView: AdView) {
        emitAdEvent(
            code: event.code,
            type: typeName(event.type),
            message: event.message,
            reason: event.data?["reason"]
        )

        guard event.type == .adLoaded else { return }

        let size = adView.intrinsicContentSize
        if size.width > 0 && size.height > 0 {
            onAdSizeChanged?(["width": Double(size.width), "height": Double(size.height)])
            delegate?.onAdSizeChanged(self, width: Double(size.width), height: Double(size.height))
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
        delegate?.onAdEvent(self, code: code, type: type, message: message, reason: reason)
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
}
