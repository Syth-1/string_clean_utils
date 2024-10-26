import * as fs from 'fs';
import path from 'path';
import { diacriticsMap } from './diacritics';

// path to generate the script
const srcPath = "src/generated"

type DiacriticsMap = { [key: number]: number | number[] };

async function fetchConfusables() : Promise<Array<string>> { 
    const URL = "https://www.unicode.org/Public/security/latest/confusables.txt"

    const confusablesResp = await fetch(URL)

    if (confusablesResp.status !== 200) {
        throw Error("could not download confusables txt, check url!")
    }

    const confusablesText = await confusablesResp.text()

    return confusablesText.split("\n")
}

async function main() {
    const lines = await fetchConfusables()

    const singleUnitLookup: DiacriticsMap = {};
    const multiUnitLookup: DiacriticsMap = {}; // holds an accent converted to multiple characters.

    for (const line of lines) {
        const parts = line.split(' ;\t');
        if (parts.length < 2) continue;

        try {
            const accent = parseInt(parts[0].trim(), 16);
            const baseUnits = parts[1].trim().split(' ');

            if (baseUnits.length === 1) {
                const base = parseInt(baseUnits[0], 16);
                singleUnitLookup[accent] = base;
            } else {
                const bases = baseUnits.map(e => parseInt(e, 16));
                multiUnitLookup[accent] = bases;
            }

        } catch {}
    }
    
    // -- fixing: replace M
    const mLetterAccents = ["118E3", "006D", "217F", "1D426", "1D45A", "1D48E", "1D4C2", "1D4F6", "1D52A", "1D55E", "1D592", "1D5C6", "1D5FA", "1D62E", "1D662", "1D696", "11700"];
    const mLetterCodeUnit = 'm'.charCodeAt(0);

    mLetterAccents.forEach(str => {
        const accent = parseInt(str, 16);
        singleUnitLookup[accent] = mLetterCodeUnit;
    });

    // numbers/others looks like l, we remove completely
    const lAccentsToRemove = [
        "05C0", "007C", "2223", "23FD", "FFE8", "0031", "0661", "06F1", "10320", //
        "1E8C7", "1D7CF", "1D7D9", "1D7E3", "1D7ED", "1D7F7", "217C", "05D5", //
        "05DF", "0627", "1EE00", "1EE80", "FE8E", "FE8D", "07CA", "1028A",
    ];

    lAccentsToRemove.forEach(str => {
        const accent = parseInt(str, 16);
        delete singleUnitLookup[accent];
    });

    // letts converted to L instead of I
    const lAccentsToI = [
        "0049", "FF29", "2160", "1D408", "1D43C", "1D470", "1D4D8", "1D540", "1D574", "1D5A8", //
        "1D5DC", "1D610", "1D644", "1D678", "0196", "01C0", "0399", "1D6B0", "1D6EA", "1D724", //
        "1D75E", "1D798", "2C92", "0406", "04C0", "2D4F", "16C1", "A4F2", "16F28", "10309"
    ];
    const ILetterCodeUnit = 'I'.charCodeAt(0);

    lAccentsToI.forEach(str => {
        const accent = parseInt(str, 16);
        singleUnitLookup[accent] = ILetterCodeUnit;
    });

    const autogen = '\n/// AUTO GENERATED USING generator/confusable_to_map.ts, DO NOT EDIT MANUALLY.';

    /// -- single units
    const singleUnitFile = path.join(srcPath, 'single_unit_map.ts');
    const singleUnitCode = `export const singleUnitLookup = ${JSON.stringify(singleUnitLookup)};`
    const seperator = '\n\n'

    fs.mkdirSync(srcPath, { recursive: true });
    fs.writeFileSync(singleUnitFile, [autogen, singleUnitCode].join(seperator))

    /// -- multi units
    const multiUnitFile = path.join(srcPath, 'multi_unit_map.ts');
    const multiUnitCode = `export const multiUnitLookup = ${JSON.stringify(multiUnitLookup)};`
    
    fs.writeFileSync(multiUnitFile, [autogen, multiUnitCode].join(seperator))

    /// -- diacritics
    const newDiacriticsSingleMap: DiacriticsMap = {};
    const newDiacriticsMultipleMap: DiacriticsMap = {};

    for (const [key, val] of Object.entries(diacriticsMap)) {
        const accentUnit = key.charCodeAt(0);
        const baseUnits = Array.from(val.toString()).map(c => c.charCodeAt(0));

        if (baseUnits.length === 1)
            newDiacriticsSingleMap[accentUnit] = baseUnits[0];
        else
            newDiacriticsMultipleMap[accentUnit] = baseUnits;
    }

    const diacriticsFile = path.join(srcPath, 'diacritics_map.ts');
    const diacriticsSingleCode = `export const diacriticsSingleLookup = ${JSON.stringify(newDiacriticsSingleMap)};`
    const diacriticsMultiCode = `export const diacriticsMultiLookup = ${JSON.stringify(newDiacriticsMultipleMap)};`
    
    fs.writeFileSync(diacriticsFile, 
        [
            autogen, 
            diacriticsSingleCode, 
            diacriticsMultiCode
        ].join(seperator)
    )

    console.log("--- generator finished ---")
}

await main();