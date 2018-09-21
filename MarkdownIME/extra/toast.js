export var ToastStatus;
(function (ToastStatus) {
    ToastStatus[ToastStatus["Hidden"] = 0] = "Hidden";
    ToastStatus[ToastStatus["Shown"] = 1] = "Shown";
    ToastStatus[ToastStatus["Hiding"] = 2] = "Hiding";
})(ToastStatus || (ToastStatus = {}));
;
/**
 * Tooltip Box, or a Toast on Android.
 *
 * Providing a static method `showToast(text, coveron[, timeout])`, or you can construct one and control its visibility.
 */
var Toast = /** @class */ (function () {
    function Toast(document, text) {
        this.status = ToastStatus.Hidden;
        this.document = document;
        var ele = document.createElement("div");
        ele.setAttribute("style", Toast.style);
        ele.textContent = text;
        ele.addEventListener('mousedown', this.dismiss.bind(this), false);
        this.element = ele;
    }
    Toast.prototype.setPosition = function (left, topOrBottom, isBottom) {
        var ele = this.element;
        ele.style.left = left + 'px';
        ele.style.top = isBottom && 'initial' || (topOrBottom + 'px');
        ele.style.bottom = isBottom && (topOrBottom + 'px') || 'initial';
    };
    Toast.prototype.show = function (timeout) {
        var _this = this;
        var ele = this.element;
        var dismiss = this.dismiss.bind(this);
        if (!ele.parentElement)
            this.document.body.appendChild(ele);
        setTimeout(function () {
            _this.status = ToastStatus.Shown;
            ele.style.opacity = '1';
            ele.style.marginTop = '0';
            if (timeout)
                setTimeout(dismiss, timeout);
        }, 10);
    };
    Toast.prototype.dismiss = function () {
        var _this = this;
        if (this.status !== ToastStatus.Shown)
            return;
        this.status = ToastStatus.Hiding;
        var ele = this.element;
        ele.style.opacity = '0';
        ele.style.marginTop = '-10px';
        setTimeout(function () {
            ele.parentNode.removeChild(ele);
            _this.status = ToastStatus.Hidden;
        }, 300);
    };
    /**
     * A Quick way to show a temporary Toast over an Element.
     *
     * @param {string} text     message to be shown
     * @param {Element} ref     the location reference
     * @param {number} timeout  time in ms. 0 = do not dismiss.
     * @param {boolean} cover   true = cover on the ref. false = shown on top of the ref.
     */
    Toast.showToast = function (text, ref, timeout, cover) {
        var document = ref.ownerDocument;
        var rect = ref['getBoundingClientRect'] && ref.getBoundingClientRect() || { left: 0, top: 0 };
        var toast = new Toast(document, text);
        var x = rect.left + document.body.scrollLeft;
        var y = rect.top + document.body.scrollTop;
        toast.setPosition(x, y, !cover);
        toast.show(timeout);
        return toast;
    };
    Toast.SHORT = 1500;
    Toast.LONG = 3500;
    Toast.style = "\nposition: absolute;\nfont-family: sans-serif;\npadding: 5px 10px;\nbackground: #e4F68F;\nfont-size: 10pt;\nline-height: 1.4em;\ncolor: #000;\nz-index: 32760;\nmargin-top: -10px;\ntransition: .2s ease;\nopacity: 0;\n";
    return Toast;
}());
export { Toast };
