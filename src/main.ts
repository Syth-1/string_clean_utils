import { diacriticsSingleLookup, diacriticsMultiLookup } from './generated/diacritics_map';
import { singleUnitLookup } from './generated/single_unit_map';
import { multiUnitLookup } from './generated/multi_unit_map';

export class StringCleanUtils {
    private static readonly symbolsRegexBase = "!\"#$%&'()*+,\\-.\\/:;<=>?@[\\]{}\\\\^_`~|@#$%^&*()\\-=+[\\]{}:;\"'<>,?/`~!_"
    
    private static readonly subSymbolsRegex = new RegExp(`[${this.symbolsRegexBase}]`, 'g')
    private static readonly subSymbolAndWhitespaceRegex = new RegExp(
        `[${this.symbolsRegexBase}\\s+]`, 'g'
    )

    /// Replaces diacritics & accents with original characters.
    static normalize(text: string): string {
        return String.fromCharCode(...this.replaceCodeUnits(Array.from(text).map(char => char.codePointAt(0)!)));
    } // use codePointAt for unicode** (charCodeAt limited to utf-16)

    /// Removes symbols from text, eg. `!@#$%^&*()[]{}~"'?+-`.
    static removeSymbols(text: string): string {
        return text.replace(this.subSymbolsRegex, '');
    }

    /// Same as [removeSymbols] but also removes whitespaces.
    static removeSymbolsAndWhitespaces(text: string): string {
        return text.replace(this.subSymbolAndWhitespaceRegex, '');
    }

    /// Note: use `String.runes` to automatically combine surrogate units.
    static replaceCodeUnits(codeUnits: Array<number>): number[] {
        const result: number[] = [];
        for (const original of codeUnits) {
            // Combining Diacritical Marks in Unicode
            if (original >= 0x0300 && original <= 0x036F) {
                continue;
            }

            const originalStr = original.toString()

            // original diacritics-single
            const diacriticsingle = diacriticsSingleLookup[
                originalStr as keyof typeof diacriticsSingleLookup // typescrpt please fix this type mess 🙏
            ];
            if (diacriticsingle !== undefined) {
                result.push(diacriticsingle);
                continue;
            }

            // original diacritics-multi
            const diacriticmultiple = diacriticsMultiLookup[
                originalStr as keyof typeof diacriticsMultiLookup
            ];
            if (diacriticmultiple !== undefined) {
                result.push(...diacriticmultiple);
                continue;
            }

            // single-unit replacements
            const single = singleUnitLookup[
                originalStr as keyof typeof singleUnitLookup
            ];
            if (single !== undefined) {
                result.push(single);
                continue;
            }

            // multi-unit replacements
            const multiple = multiUnitLookup[
                originalStr as keyof typeof multiUnitLookup
            ];
            if (multiple !== undefined) {
                result.push(...multiple);
                continue;
            }

            // no replacement
            result.push(original);
        }
        return result;
    }
}