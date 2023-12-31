import React from "react";
import {CustomValidation, RapidInputEvent} from "../interface/rr-mixed-interface";


export type InputType =
    'text'
    | 'email'
    | 'checkbox'
    | 'color'
    | 'file'
    | 'date'
    | 'datetime-local'
    | 'hidden'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'tel'
    | 'time'
    | 'url'
    | 'week'
    | 'switch'
    | 'textarea'
    | 'select'

export interface InputDataDefinition {
    name: string
    value?: unknown
    defaultValue?: any
    type?: InputType
}

export interface HiddenInputDefinition extends InputDataDefinition{

}

export interface BaseInputDefinition extends InputDataDefinition {
    disabled?: boolean
    required?: boolean
    autoFocus?: boolean

    label?: React.ReactNode;
    error?: boolean
    wasValidated?: boolean
    helperText?: React.ReactNode
    errorText?: React.ReactNode
    successText?: React.ReactNode

    changeEvent?: RapidInputEvent
    blurEvent?: RapidInputEvent

    customValidation?: CustomValidation;
}

export interface OnOffInputDefinition extends BaseInputDefinition {
    sendValue?: unknown
}

export interface InputDefinition extends BaseInputDefinition {
    placeholder?: string
    autoComplete?: string
}

export interface FileInputDefinition extends InputDefinition {
    fileNames?: any
    fileExtensions?: Array<string>
    minSize?: number
    maxSize?: number
    maxFiles?: number
    isMultiple?: boolean
    urlPrefix?: string
}

export interface TextAreaDefinition extends InputDefinition {
    rows?: string
    cols?: string
}

export interface SelectDefinition extends InputDefinition {
    isMulti?: boolean
    isClearable?: boolean
    isSearchable?: boolean
    options: Array<any>;
    optionLabel: string;
    optionValue: string;
}

export class FieldSpecification {

    private fieldDefinition: Map<string, InputDataDefinition> = new Map<string, InputDataDefinition>()

    public text(spec: InputDefinition): FieldSpecification {
        spec.type = "text"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public file(spec: FileInputDefinition): FieldSpecification {
        spec.type = "file"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public url(spec: InputDefinition): FieldSpecification {
        spec.type = "url"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public password(spec: InputDefinition): FieldSpecification {
        spec.type = "password"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public textArea(spec: TextAreaDefinition): FieldSpecification {
        spec.type = "textarea"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public select(spec: SelectDefinition): FieldSpecification {
        spec.type = "select"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public email(spec: InputDefinition): FieldSpecification {
        spec.type = "email"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public checkbox(spec: OnOffInputDefinition): FieldSpecification {
        spec.type = "checkbox"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public hidden(spec: HiddenInputDefinition): FieldSpecification {
        spec.type = "hidden"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public switch(spec: OnOffInputDefinition): FieldSpecification {
        spec.type = "switch"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public number(spec: OnOffInputDefinition): FieldSpecification {
        spec.type = "number"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public time(spec: OnOffInputDefinition): FieldSpecification {
        spec.type = "time"
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

    public removeItem(name: string): FieldSpecification {
        this.fieldDefinition.delete(name)
        return this
    }


    public getDefinitions() {
        return this.fieldDefinition
    }

    public getDefByName(name: string) {
        return this.fieldDefinition.get(name)
    }

    public updateFieldDef(spec: BaseInputDefinition): FieldSpecification {
        this.fieldDefinition.set(spec.name, spec)
        return this
    }

}