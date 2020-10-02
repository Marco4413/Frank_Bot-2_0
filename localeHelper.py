
import json
from os import path, listdir


localizationDIR = "./localization"
availableLocales = listdir("./localization")


def translate(origin: dict, out: dict, path: str):
    keys = list(origin.keys())
    keysLength = len(keys)
    for i in range(keysLength):
        key = keys[i]
        currentPath = path + "." + key
        valueType = type(origin[key])
        print("\n{}/{}".format(i + 1, keysLength))
        if valueType is dict:
            print("Jumping into new dictionary \"{}\"".format(currentPath))
            out[key] = {}
            translate(origin[key], out[key], currentPath)
        else:
            print("Translation for \"{}\"\nOriginal: \"{}\"".format(currentPath, origin[key]))
            translation = input("Translation: ")
            if translation == "":
                print("No translation was given, keeping the original one")
                out[key] = origin[key]
            else:
                out[key] = translation

def main():
    print("Insert the name of the locale you want to translate from")
    originLocale = input()
    if originLocale + ".json" in availableLocales:
        print("Insert the name of the locale you're translating to")
        outputLocale = input()
        if outputLocale + ".json" in availableLocales:
            print("Locale already exists, please create a new one")
        else:
            locale = {}
            translated = {}
            with open(path.join(localizationDIR, originLocale + ".json"), "r") as file:
                locale = json.load(file)
            translate(locale, translated, originLocale)
            with open(path.join(localizationDIR, outputLocale + ".json"), "w") as file:
                json.dump(translated, file, indent="    ")
    else:
        print("Specified origin doesn't exist: " + originLocale)

if __name__ == "__main__":
    main()
