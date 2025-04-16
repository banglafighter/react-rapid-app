export default class StringUtil {

    public static capitalize(word: string) {
        return word.charAt(0).toUpperCase() + word.substring(1);
    }

    public static camelCaseToHumanReadable(text: string) {
        let words = text.match(/[A-Za-z0-9][a-z]*/g) || [];
        return words.map(this.capitalize).join(" ");
    }

    public static smallFirstLatter(word: string) {
        return word.charAt(0).toLowerCase() + word.slice(1);
    }

    public static capitalizeFirstLetter(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    public static camelCaseTo(text: string, char: string = "_") {
        return text.replaceAll(/[A-Z]/g, letter => char + letter);
    }

    public static splitCamelCaseToSpace(text: string) {
        text = text.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
        text = this.containSingleSpace(text)
        return text.trim()
    }

    public static containSingleSpace(text: string) {
        return text.replace(/ +(?= )/g, '');
    }

    public static replaceMoreThanOneOccurrence(text: string, char: any, replace: any = undefined, regex: any = undefined) {
        if (!regex) {
            regex = char
        }
        regex += "{2,}"
        if (!replace) {
            replace = char
        }
        let re = new RegExp(regex, "g");
        return text.replace(re, replace);
    }

    public static findReplace(text: string, find: string, replace: string) {
        let findRegex = new RegExp(find, 'g');
        return text.replaceAll(findRegex, replace);
    }

    public static removeSpecialCharacter(text: string, replace: string = "") {
        if (text) {
            text = text.replace(/[^\w\s-_/]/gi, replace);
        }
        return text
    }

    public static nameToURL(name: string) {
        if (!name) {
            return name
        }
        let url: string = StringUtil.splitCamelCaseToSpace(name)
        url = StringUtil.findReplace(url, " ", "-")
        url = StringUtil.findReplace(url, "_", "-")
        url = StringUtil.replaceMoreThanOneOccurrence(url, "_")
        url = StringUtil.replaceMoreThanOneOccurrence(url, undefined, "-", "\\-")
        url = StringUtil.removeSpecialCharacter(url)
        url = url.toLowerCase()
        return url
    }

    public static nameToLabel(name: string) {
        if (!name) {
            return name
        }
        let label: string = StringUtil.camelCaseToHumanReadable(name)
        label = StringUtil.replaceMoreThanOneOccurrence(label, undefined, "-", "\\-")
        label = StringUtil.findReplace(label, "-", " ")
        label = StringUtil.removeSpecialCharacter(label)
        label = StringUtil.capitalizeFirstLetter(label)
        return label
    }

    public static nameToSystemName(name: string) {
        if (!name) {
            return name
        }
        let systemName: string = StringUtil.nameToLabel(name)
        systemName = StringUtil.findReplace(systemName, " ", "")
        systemName = StringUtil.smallFirstLatter(systemName)
        return systemName
    }

}