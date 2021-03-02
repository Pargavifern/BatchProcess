import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent, FlowNavigationBackEvent, FlowAttributeChangeEvent, FlowNavigationPauseEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';

export default class FlowNavigation extends LightningElement {
    @api pause;
    @api next;
    @api previous
    @api showNext;
    @api showPrevious;
    @api showPause;
    @api showCustomButton1;
    @api customButton1;

    @api availableActions = [];

    handleCustomButton1() {
        sessionStorage.setItem('customButtonEvent', true);
        if (this.availableActions.find(action => action === 'NEXT')) {
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    handleGoNext() {
        if (this.availableActions.find(action => action === 'NEXT')) {
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        } else if (this.availableActions.find(action => action === 'FINISH')) {
            const navigateFinishEvent = new FlowNavigationFinishEvent();
            this.dispatchEvent(navigateFinishEvent);
        }
    }

    handleGoPrevious() {
        if (this.availableActions.find(action => action === 'BACK')) {
            const navigateBackEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateBackEvent);
        }
    }

    handleGoPause() {
        if (this.availableActions.find(action => action === 'PAUSE')) {
            const navigatePauseEvent = new FlowNavigationPauseEvent();
            this.dispatchEvent(navigatePauseEvent);
        }
    }

}