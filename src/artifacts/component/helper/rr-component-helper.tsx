import {
    BaseInputDefinition,
    FieldSpecification,
    InputDataDefinition,
    OnOffInputDefinition
} from "../../data/rr-input-definition";
import {ParentActionCaller, RapidInputEvent} from "../../interface/rr-mixed-interface";
import {RapidMessageData, Status} from "../../data/rr-message-data";
import {RapidUtil} from "../../utils/rr-util";

export class RapidComponentHelper {

    private state!: any;
    private fieldSpecification!: FieldSpecification;
    private parentActionCaller?: ParentActionCaller;

    constructor(state: any, fieldSpecification: FieldSpecification, parentActionCaller?: ParentActionCaller) {
        this.state = state
        this.fieldSpecification = fieldSpecification
        this.parentActionCaller = parentActionCaller
    }

    public updateState(state: any) {
        if (state.constructor.name !== this.state.constructor.name) {
            this.state = state
        }
    }

    private getFilesFromInput(name: string, target: any): Array<File> {
        let files: any = new Array<File>();
        if (this.state.formData && this.state.formData[name] && this.state.formData[name] instanceof FormData) {
            files = this.state.formData[name];
        }
        if (target && target.files) {
            Array.from(target.files).forEach((file: any) => {
                files.push(file)
            });
        }
        return files;
    }

    private notifyComponentChange() {
        if (this.parentActionCaller) {
            this.parentActionCaller.call("notify")
        }
    }

    private fireInputEvent(event?: RapidInputEvent, target?: any) {
        if (event && event.fire) {
            event.fire(target);
        }
    }

    private getInputEvent(name: string, eventName: string) {
        let definition: any = this.fieldSpecification.getDefByName(name)
        if (definition) {
            return definition[eventName]
        }
        return undefined
    }

    public updateFormData(name: string, value: any) {
        if (this.state.formData) {
            this.state.formData[name] = value;
            this.notifyComponentChange()
        }
    }

    public updateFieldSpecificationValidation(name: string, wasValidated?: boolean, error?: boolean, errorMessage?: string) {
        let definition: BaseInputDefinition = this.fieldSpecification.getDefByName(name) as BaseInputDefinition
        if (definition) {
            definition.wasValidated = wasValidated
            definition.error = error
            if (errorMessage) {
                definition.errorText = errorMessage
            }
            this.fieldSpecification.updateFieldDef(definition)
        }
    }

    private removeValidationError(name: string) {
        this.updateFieldSpecificationValidation(name, false, false)
    }

    public addValidationError(name: string) {
        this.updateFieldSpecificationValidation(name, true, true)
    }

    public getValueFromFormData(name: string, defaultValue: any = "") {
        if (this.state.formData && this.state.formData[name] != null && this.state.formData[name] !== "") {
            return this.state.formData[name];
        }
        return defaultValue;
    }

    public getFormData() {
        return this.state.formData
    }

    public setFormData(formData: any) {
        this.state.formData = formData
    }

    public removeDataFromFormData(name: string) {
        if (this.state.formData && this.state.formData[name]) {
            delete this.state.formData[name]
        }
    }

    public setValueToFromData(name: string, value: any) {
        this.state.formData[name] = value
    }

    private processCustomValidation(definition: any, name: string) {
        if (definition.customValidation && definition.customValidation.validate) {
            let response: RapidMessageData = definition.customValidation.validate(name, this.getValueFromFormData(name), this.state.formData);
            if (response.status === Status.FAILED) {
                this.updateFieldSpecificationValidation(name, true, true, response.message)
                return false;
            }
        }
        return true
    }

    public validateEachDataOfFormData() {
        const _this = this;
        let isValid: boolean = true;
        let definitions: any = new Map(this.fieldSpecification.getDefinitions())
        if (definitions) {
            definitions.forEach(
                (definition: BaseInputDefinition, name: string) => {
                    if (definition.isHideInput) {
                        return
                    } else if (definition.required && _this.getValueFromFormData(name, null) == null) {
                        isValid = false;
                        _this.addValidationError(name)
                    } else if (!_this.processCustomValidation(definition, name)) {
                        isValid = false;
                    } else {
                        _this.updateFieldSpecificationValidation(name, true)
                    }
                }
            )
        }
        return isValid
    }

    public handleOnChangeEvent(inputAttributes: any) {
        const _this = this;
        inputAttributes.onChange = (event: any) => {
            const target = event.target;
            const name = target.name;
            let value;
            let isDeleteValue = false
            if (target.type === 'file') {
                value = this.getFilesFromInput(name, target);
            } else if (target.type === 'checkbox') {
                let inputDefinition: OnOffInputDefinition | undefined = this.fieldSpecification.getDefByName(name)
                let sendValue: any = undefined
                if (inputDefinition && inputDefinition.sendValue !== undefined && inputDefinition.sendValue !== null) {
                    sendValue = inputDefinition.sendValue
                }
                value = target.checked;
                if (target.checked && sendValue !== undefined) {
                    value = sendValue
                } else if (sendValue !== undefined) {
                    isDeleteValue = true
                }
            } else {
                value = target.value;
            }
            _this.removeValidationError(name);
            if (isDeleteValue) {
                _this.removeDataFromFormData(name)
                _this.notifyComponentChange()
            } else {
                _this.updateFormData(name, value)
            }
            _this.fireInputEvent(_this.getInputEvent(name, "changeEvent"), event)
        }
        return inputAttributes
    }

    public handleOnBlurEvent(inputAttributes: any) {
        const _this = this;
        inputAttributes.onBlur = (target: any) => {
            const name = inputAttributes.name;
            _this.fireInputEvent(_this.getInputEvent(name, "blurEvent"), target)
        };
        return inputAttributes
    }

    public updateInputValue(name: string, inputAttributes: any) {
        let definition: any = this.fieldSpecification.getDefByName(name)
        let defaultValue = ""
        if (definition && definition.defaultValue) {
            defaultValue = definition.defaultValue
        }
        let value = this.getValueFromFormData(name, defaultValue)
        if (value && ((value instanceof Array && value.some((item: any) => item instanceof File)) || (value instanceof File))) {
            if (value instanceof File) {
                inputAttributes.fileNames = value.name
            } else {
                inputAttributes.fileNames = []
                value.some((item: any) => {
                    if (item && item instanceof File) {
                        inputAttributes.fileNames.push(item.name)
                    }
                })
            }
            value = ""
        } else if (definition && definition.type && definition.type === "file") {
            inputAttributes.fileNames = value
            value = ""
        }
        inputAttributes.value = value
        return inputAttributes
    }

    getInputDefinitionToAttributes(name: string) {
        let inputDefinition: InputDataDefinition | undefined = this.fieldSpecification.getDefByName(name)
        let response: any = {}
        if (inputDefinition) {
            switch (inputDefinition.type) {
                case "select":
                    response = RapidUtil.removeProperty(inputDefinition, ["type"])
                    break
                default:
                    response = RapidUtil.removeProperty(inputDefinition)
            }
        }
        return response
    }

    public showServerSideFormValidationError(errors: Object) {
        for (let [name, message] of Object.entries(errors)) {
            this.updateFieldSpecificationValidation(name, true, true, message)
        }
    }
}