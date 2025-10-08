export default class StringUtil {

    static findAndReplaceWith(text: string, find: string, replace: string): string {
        return text.split(find).join(replace);
    }

    static lowerFirstChar(text: string): string {
        return text ? text.charAt(0).toLowerCase() + text.slice(1) : "";
    }

    static camelcaseTo(text: string, to: string = "_"): string {
        text = text.trim();
        return text.replace(/(?<!^)(?=[A-Z])/g, to);
    }

    static replaceMultipleOccurrenceToSingleWith(text: string, to: string = "_"): string {
        const escaped = to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`${escaped}+`, "g");
        return text.replace(regex, to);
    }

    static systemReadable(text: string): string {
        text = this.camelcaseTo(text, "_");
        text = this.findAndReplaceWith(text, " ", "_");
        text = this.findAndReplaceWith(text, "-", "_");
        text = this.replaceMultipleOccurrenceToSingleWith(text, "_");
        text = text.replace(/[^a-zA-Z0-9_]/g, "");
        return text.trim().toLowerCase();
    }

    static removeSpecialCharacter(text: string, to: string = ""): string {
        // Includes Bangla Unicode range (\u0980-\u09FF)
        return text.replace(/[^\w\s/\-\u0980-\u09FF]/g, to);
    }

    static removeLeadingNumber(text: string): string {
        return text.replace(/^\d+/, "");
    }

    static underscoreName(name: string): string {
        name = this.lowerFirstChar(name);
        name = this.systemReadable(name);
        name = this.removeSpecialCharacter(name);
        name = this.removeLeadingNumber(name);
        return name;
    }

    static replaceSpaceWith(text: string, to: string = "_"): string {
        return text.replace(/\s+/g, to);
    }

    static humanReadable(text: string | null | undefined, defaultValue: string | null = null): string | null {
        if (text === null || text === undefined) {
            return defaultValue
        }
        text = this.camelcaseTo(text, " ");
        text = this.findAndReplaceWith(text, "-", " ");
        text = text.trim();
        text = text.replace(/\b\w/g, char => char.toUpperCase());
        return this.replaceSpaceWith(text, " ");
    }

    static textToUrlText(text: string | null, defaultValue: string | null = null): string | null {
        if (!text) {
            return defaultValue
        }
        text = this.camelcaseTo(text, "-");
        text = this.findAndReplaceWith(text, " ", "-");
        text = this.findAndReplaceWith(text, "_", "-");
        text = this.replaceMultipleOccurrenceToSingleWith(text, "-");
        text = this.removeSpecialCharacter(text);
        text = text.trim();
        text = text.replace(/^-+|-+$/g, "");
        text = text.toLowerCase();
        return text;
    }

    static padZero(number: number, width: number = 2): string {
        return number.toString().padStart(width, "0");
    }

}