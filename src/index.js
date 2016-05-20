import $ from 'jquery';
import debounce from 'lodash.debounce';
import getViewportDimensions from './getViewportDimensions';

const $window = $(window);
const $doc = $(document);
const $body = $(document.body);
const modalDataAttr = 'umodal-id';
const triggerDataAttr = `[data-${modalDataAttr}]`;
const modalContentClassName = '.unfoldModal-content';
const modalFooterClassName = '.unfoldModal-footer';
const modalHeaderClassName = '.unfoldModal-header';
const overlayClassName = '.unfoldModal-overlay';
const scrollClassName = 'unfoldModal-content--scroll';
const showClassName = 'is-visible';
const closeModalClassName = '.close-modal';
let $overlay;

const noop = () => undefined;
const isFunction = fn => typeof fn === 'function';

function positionModal ($modal) {
    const $modalContent = $($modal.find(modalContentClassName)[0]);

    $body.removeClass('fixed');
    $body.css('top', 'auto');  
    $modalContent.css('max-height', 'none'); 
    $modalContent.removeClass(scrollClassName);
    $modal.css('top', 0);
    $modal.css('left', 0);

    const { height: viewHeight, width: viewWidth } = getViewportDimensions(window, document);
    const modalHeight = $modal.outerHeight(true);
    const modalWidth = $modal.outerWidth(true);
    
    if (window.matchMedia('(min-width: 768px)')) {
        const top = (modalHeight <= viewHeight)
            ? (((viewHeight - modalHeight) / 2) + $doc.scrollTop()) + 'px'
            : $window.scrollTop();

        const left = (((viewWidth - modalWidth) / 2) - $modal.offset().left) + 'px';

        $modal.css({ left, top });
    } else {
        const footerHeight = (window.matchMedia('(min-height: 321px)'))
            ? $modal.find(modalFooterClassName).outerHeight(true) || 0
            : 0;

        const headerHeight = $modal.find(modalHeaderClassName).outerHeight(true) || 0;

        $modalContent
            .css('max-height', (viewHeight - footerHeight - headerHeight) + 'px')
            .addClass(scrollClassName);

        $body.addClass('fixed').css('top', ($modal.scrollPosition * -1));

        if (/Android/.test(window.navigator.appVersion)) {
            document.activeElement.scrollIntoViewIfNeeded();                
        }
    }
}

function ensureOverlay () {
    // Already created by unfold
    if ($overlay) return $overlay;

    // Exists for some other reason
    const o = $(overlayClassName);
    if (o.length) return ($overlay = o);

    // Doesn't exist; add it
    const cls = overlayClassName.replace('.', '');
    $overlay = $(`<div class="${cls}"></div>`);
    $body.append($overlay);
    return $overlay;
}

class Unfold {
    constructor (elementId) {
        this.$modal = $(elementId);
        this.$modal.scrollPosition = 0;
        this.identifier = elementId;
        this.eventIdentifier = 'unfold_' + elementId;
        this.reset();
    }

    reset () {
        this.$modal.find(closeModalClassName)
            .on(`click.${this.eventIdentifier}`, () => this.close());
    }

    close (ev) {
        if(!this.isOpen()) { return; }
        ensureOverlay().off(`click.${this.eventIdentifier}`);
        ensureOverlay().removeClass(showClassName);
        this.$modal.removeClass(showClassName);
        $body.removeClass('fixed').css('top', 'auto');
        $('body, html').animate({
            scrollTop: this.$modal.scrollPosition
        }, 0);
        $window.off(`resize.${this.eventIdentifier}`);
        this._callback(ev);
    }

    open () {
        unfoldFactory.closeAll(m => m !== this);
        this.$modal.scrollPosition = $doc.scrollTop();
        ensureOverlay().addClass(showClassName);
        this.$modal.addClass(showClassName);

        $window.on(
            `resize.${this.eventIdentifier}`,
            debounce(positionModal(this.$modal), 200)
        );

        positionModal(this.$modal);

        setTimeout(() => {
            ensureOverlay().on(`click.${this.eventIdentifier}`, () => this.close());
        }, 1);
    }

    onClose (callback) {
        if (!isFunction(callback)) callback = noop;
        this._callback = callback;
    }

    isOpen () {
        return this.$modal.hasClass(showClassName);
    }

    destroy () {
        this.close();
        $window.off(this.eventIdentifier);
        ensureOverlay().off(this.eventIdentifier);
    }
}

const unfoldFactory = {
    modals: [],
    _triggerModalMap: {},

    get (elemId) {
        return this.modals.filter(m => m.identifier === elemId)[0];
    },

    create (elemId, ...triggers) {
        let modal = this.get(elemId);

        if (!this._triggerModalMap[elemId]) this._triggerModalMap[elemId] = [];

        if (!modal) {
            modal = new Unfold(elemId);
            this.modals.push(modal);
        }

        triggers && triggers.filter(t => this._triggerModalMap[elemId].indexOf(t) === -1)
            .forEach((trigger) => {
                $(trigger).on(`click.${modal.eventIdentifier}`, () => modal.open());
                this._triggerModalMap[elemId].push(trigger);
            });
        
        return modal;
    },

    init () {
        //make sure this event is added to the loop.
        setTimeout(() => {
            const triggers = [].slice.apply($(triggerDataAttr));
            triggers.forEach((trigger) => {
                this.create('#' + $(trigger).data(modalDataAttr), trigger);
            });
        }, 1);
    },

    destroy () {
        this.modals.forEach(modal => {
            this._triggerModalMap[modal.identifier]
                .forEach(trigger => $(trigger).off(`click.${modal.eventIdentifier}`));
            modal.destroy();
        });
        
        ensureOverlay().removeClass(showClassName);
        this.modals = [];
        this._triggerModalMap = {};
    },

    closeAll (except) {
        const exceptFn = isFunction(except) ? except : () => true;
        this.modals.filter(exceptFn).forEach(modal => modal.close());
    }
};

export default unfoldFactory;