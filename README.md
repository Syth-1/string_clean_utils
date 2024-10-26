# A Typescript library to remove/replace diacritics, accents, symbols & confusables from text

> [!NOTE]  
> This project is a Typescript implamentation of [`namidaco/string_clean_utils`](https://github.com/namidaco/string_clean_utils/tree/main)

## Examples Usage

- Replaces diacritics & accents with original text
```typescript
    const normalized = StringCleanUtils.normalize('𝒉𝒂𝒓𝒍𝒆𝒚𝒔 𝒊𝒏 𝒉𝒂𝒘𝒂𝒊𝒊 - 𝒌𝒂𝒕𝒚 𝒑𝒆𝒓𝒓𝒚');
    console.log(normalized); // 'harleys in hawaii - katy perry';

    const normalized2 = StringCleanUtils.normalize('𝑻𝒉𝒆 ℚ𝕦𝕚𝕔𝕜 Ｂｒｏｗｎ Fox 𝔍𝔲𝔪𝔭𝔢𝔡 ⓞⓥⓔⓡ ʇɥǝ 𝗟𝗮𝘇𝘆 𝙳𝚘𝚐');
    console.log(normalized2); // 'The Quick Brown Fox Jumped over the Lazy Dog';
```

- Remove symbols from text
```typescript
    const normalized = StringCleanUtils.removeSymbols('The [Quick }Brown Fox %Jumped over ^the Lazy @Dog');
    console.log(normalized); // 'The Quick Brown Fox Jumped over the Lazy Dog';
```
  
- Remove symbols & whitespaces from text
```typescript
    const normalized = StringCleanUtils.removeSymbolsAndWhitespaces('The [Quick }Brown Fox %Jumped over ^the Lazy @Dog');
    console.log(normalized); // 'TheQuickBrownFoxJumpedovertheLazyDog';
```

### Testing
> [!IMPORTANT]  
> Altho this project uses Bun for testing, it is not required for using the library.

- To run tests, navigate to [`test`](./test/):
```bash
    cd test
```
- then run the following command:
```bash
    bun test
```
### Note
- original project source: https://github.com/namidaco/string_clean_utils/tree/main

- confusable & diacritics rules are generated with [`confusable_to_map.ts`](./generator/confusable_to_map.ts) relying on [`confusables.txt`](https://www.unicode.org/Public/security/latest/confusables.txt) & [`diacritics.ts`](./generator/diacritics.ts)
  - confusable source: https://www.unicode.org/Public/security/latest/confusables.txt 
  - diacritics source: https://www.npmjs.com/package/diacritics-map