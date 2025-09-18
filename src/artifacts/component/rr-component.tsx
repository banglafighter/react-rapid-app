import React from 'react';
import {SortDirection} from "../data/rr-mixed-data";
import {RapidProps} from "../interface/rr-mixed-interface";
import RapidComponentState from "./rr-component-state";
import RapidReactComponent from "./rr-react-component";
import {FieldSpecification} from "../data/rr-input-definition";
import {RapidComponentHelper} from "./helper/rr-component-helper";
import RapidAppConfig from "../config/rr-app-config";
import {RapidException} from "../common/rr-exception";
import {RapidMessageData} from "../data/rr-message-data";
import {RapidUtil} from "../utils/rr-util";
import {RapidHttpRequestHelper} from "./helper/rr-http-request-helper";
import RapidStaticHolder from "../utils/rr-static-holder";
import {RapidAppContext} from "../config/rr-app-context";

export default class RapidComponent<P extends RapidProps, S extends RapidComponentState> extends RapidReactComponent<P, S> {


    private readonly REDIRECT_DATA: string = "REDIRECT_DATA";

    // @ts-ignore
    state: RapidComponentState = new RapidComponentState();
    public fieldSpecification: FieldSpecification = new FieldSpecification();
    private rapidComponentHelper!: RapidComponentHelper
    public httpRequest!: RapidHttpRequestHelper
    pageTitle!: string
    static contextType = RapidAppContext
    context: any


    constructor(props: any) {
        super(props);
        const _this = this;
        this.rapidComponentHelper = new RapidComponentHelper(
            this.state,
            this.fieldSpecification, _this.allowControlFromChild()
        )
        this.httpRequest = new RapidHttpRequestHelper(_this.appConfig(), _this.allowControlFromChild(), _this)
        this.fieldDefinition(this.fieldSpecification)
        this.setPageTitle()
    }

    public setPageTitle(pageTitle?: string) {
        let title = pageTitle
        if (!title && this.pageTitle) {
            title = this.pageTitle
        } else if (this.props.appConfig?.pageTitle) {
            if (!document.title || document.title === "") {
                title = this.props.appConfig?.pageTitle
            }
        }
        if (title) {
            if (this.props.appConfig?.pageTitlePostFix) {
                title += " " + this.props.appConfig?.pageTitlePostFix
            }
            document.title = title
        }
    }

    public resetForm() {
        this.fieldDefinition(this.fieldSpecification)
        this.resetFormData()
    }

    public addMetaTag(attributes: object) {
        let meta = document.createElement('meta');
        let isFirst: boolean = true
        let isExistingTag: boolean = false
        Object.entries(attributes).forEach(([key, value], index) => {
            if (isFirst) {
                isFirst = false
                let existingMetaTage: any = document.querySelector('meta[' + key + '="' + value + '"]')
                if (existingMetaTage) {
                    isExistingTag = true
                    meta = existingMetaTage
                }
            }
            meta.setAttribute(key, value)
        });
        if (!isExistingTag) {
            document.getElementsByTagName('head')[0].appendChild(meta);
        }
    }

    public addSocialMediaMeta(url: string, title?: string, description?: string, image?: string) {
        if (url) {
            this.addMetaTag({"property": "og:url", "content": url})
        }
        if (title) {
            this.addMetaTag({"property": "og:title", "content": title})
        }
        if (description) {
            this.addMetaTag({"property": "og:description", "content": description})
        }
        if (image) {
            this.addMetaTag({"property": "og:image", "content": image})
        }
    }

    public removeFieldSpecification(...fields: any) {
        const _this = this
        if (fields) {
            fields.forEach((field: string) => _this.fieldSpecification.removeItem(field))
        }
    }

    private appConfig(): RapidAppConfig {
        if (this.props.appConfig) {
            return this.props.appConfig
        }
        return window.appConfig;
    }

    public getRandomKey() {
        return "" + (Math.random() * 100000000000)
    }

    public notifyComponentChange(afterNotify?: () => void) {
        this.setState<never>({
                ["componentChanged"]: this.getRandomKey()
            }, () => {
                if (afterNotify) {
                    afterNotify()
                }
            }
        );
    }

    private allowControlFromChild() {
        const _this = this;
        return {
            call(actionName?: string, data?: any) {
                switch (actionName) {
                    case "notify":
                        _this.notifyComponentChange()
                        break
                    case "showLoader":
                        _this.showLoader()
                        break
                    case "hideLoader":
                        _this.hideLoader()
                        break
                }
            }
        }
    }

    public getComponentHelper(): RapidComponentHelper {
        return this.rapidComponentHelper
    }

    public renderUI() {
        return (
            <h1>Rapid React Application View Component</h1>
        );
    }

    // Override this method on view component for field definition
    public fieldDefinition(field: FieldSpecification) {}


    public showServerSideFormValidationError(errors: Object) {
        this.rapidComponentHelper.showServerSideFormValidationError(errors)
    }


    public setInputDefaultValue(name: string, value: any) {
        this.updateInputValue(name, value)
    }

    public updateInputValueWithoutNotify(name: string, value: any) {
        let inputAttributes: any = this.rapidComponentHelper.getInputDefinitionToAttributes(name)
        inputAttributes.value = value
        this.rapidComponentHelper.updateInputValue(name, inputAttributes)
        this.state.formData[name] = value
        this.rapidComponentHelper.setFormData(this.state.formData)
    }

    public updateInputValue(name: string, value: any) {
        this.updateInputValueWithoutNotify(name, value)
        this.notifyComponentChange()
    }

    public setupFieldAttrs(name: string) {
        let inputAttributes: any = this.rapidComponentHelper.getInputDefinitionToAttributes(name)
        this.rapidComponentHelper.handleOnChangeEvent(inputAttributes)
        this.rapidComponentHelper.handleOnKewDownEvent(inputAttributes)
        this.rapidComponentHelper.handleOnBlurEvent(inputAttributes)
        this.rapidComponentHelper.updateInputValue(name, inputAttributes)
        return inputAttributes
    }

    public getFormDataValueByName(name: string, defaultValue: any = undefined) {
        if (this.state.formData && this.state.formData[name] != null) {
            return this.state.formData[name]
        }
        return defaultValue
    }

    public getFormData(message: string = "Data Validation Error") {
        if (this.rapidComponentHelper.validateEachDataOfFormData()) {
            return this.state.formData
        }
        this.notifyComponentChange()
        throw new RapidException(message)
    }

    public setInputValidationError(name: string, errorMessage: any, exceptionMessage: any = "Data Validation Error") {
        this.rapidComponentHelper.showServerSideFormValidationError({[name]: errorMessage})
        if (exceptionMessage) {
            throw new RapidException(exceptionMessage)
        }
    }

    public setFormData(formData: { [key: string]: any }) {
        this.state.formData = formData
        this.rapidComponentHelper.setFormData(formData)
        this.notifyComponentChange()
    }

    public resetFormData() {
        this.setFormData({})
    }

    public removeDataFromFormData(name: string) {
        this.rapidComponentHelper.removeDataFromFormData(name)
    }

    public setValueToFromData(name: string, value: any) {
        this.state.formData[name] = value
        this.rapidComponentHelper.setValueToFromData(name, value)
    }

    public getBaseUrl(): string {
        return this.appConfig().getBaseURL();
    }

    public showErrorFlash(message: string) {
        this.context?.updateFlashMessage(true, RapidMessageData.failed(message))
        this.setState({
                messageData: RapidMessageData.failed(message),
                isShowFlashMessage: true
            }
        );
    }

    public showSuccessFlash(message: string) {
        this.context?.updateFlashMessage(true, RapidMessageData.success(message))
        this.setState({
                messageData: RapidMessageData.success(message),
                isShowFlashMessage: true
            }
        );
    }

    public closeFlashMessage() {
        this.context?.updateFlashMessage(false)
        this.setState({
                isShowFlashMessage: false
            }
        );
    }

    public showLoader() {
        this.context?.showHideLoader(true)
        this.setState({
                isShowLoader: true
            }
        );
    }

    public hideLoader() {
        this.context?.showHideLoader(false)
        this.setState({
                isShowLoader: false
            }
        );
    }

    public redirect(url: any) {
        RapidUtil.gotoUrl(this, url);
    }

    public showLoginUI() {
        this.setState({showLoginUI: true});
    }

    public redirectWithData(url: any, data: any) {
        RapidStaticHolder.addTempData(this.REDIRECT_DATA, data);
        this.redirect(url);
    }

    public getRedirectData() {
        let data = RapidStaticHolder.tempData[this.REDIRECT_DATA];
        delete RapidStaticHolder.tempData[this.REDIRECT_DATA];
        return data;
    }

    public successRedirect(url: any, message: string) {
        RapidStaticHolder.addMessageData(message, true);
        this.redirect(url);
    }

    public failedRedirect(url: any, message: string, resumeUrl?: any) {
        RapidStaticHolder.addMessageData(message, false);
        if (resumeUrl) {
            url += "?resume=" + resumeUrl
        }
        this.redirect(url);
    }

    public showRedirectMessage() {
        if (RapidStaticHolder.message.message) {
            if (RapidStaticHolder.message.isSuccess) {
                this.showSuccessFlash(RapidStaticHolder.message.message)
            } else {
                this.showErrorFlash(RapidStaticHolder.message.message)
            }
        }
        RapidStaticHolder.message = {};
    }

    public tableColumnSortAction(event: any, sortDirection: SortDirection, fieldName?: string, callBack?: any): void {
        if (fieldName && sortDirection) {
            this.setState(status => {
                return {
                    orderBy: fieldName,
                    sortDirection: sortDirection
                }
            }, () => {
                if (callBack) {
                    callBack();
                }
            });
        }
    }

    beforeRenderCall() {
        this.rapidComponentHelper.updateState(this.state)
        this.setPageTitle()
    }

    render() {
        this.beforeRenderCall()
        return (
            <React.Fragment>
                {this.appConfig().getBeforeRenderUIView(this.state, this)}
                {this.renderUI()}
            </React.Fragment>
        )
    }

}