# Migrating to v1.0.0

Before 1.0.0, `emojibase` was known as `emoji-database` and supported all datasets and regex
patterns in the same package. During the rename, a massive rewrite occurred, incurring the
following changes.

## Ground-up Rewrite

Originally, data was provided by third-party NPM packages, and joined together to create
re-usable datasets. Overtime this became problematic, as certain features and values I
wanted to support were not available. So I opted to write my own processing and generation
layer that referenced the official Unicode specification and data files.

## Multiple Packages

Emojibase was split into 4 packages, each serving a specific purpose.

* `emojibase` - Provides utility and helper functions for working with `emojibase` and emoji data.
* `emojibase-data` - Provides pre-generated JSON datasets, with localization.
* `emojibase-regex` - Provides pre-generated regex patterns.
* `emojibase-test-utils` - Provides utility functions and test data for use within unit tests.

## Dataset Changes

All the old datasets were removed, and formats (to an extent) are no longer supported,
as we provide a CDN based approach now. However, the following list details the migration
path based on the previous dataset you were using.

* `data/compact/list.json` -> `en/compact.json`
* `data/expanded/list.json` -> `en/data.json`
* `data/extra/hexcodes.json` -> `meta/hexcodes.json`
* `data/extra/shortnames.json` -> `meta/shortnames.json`
* `data/extra/unicode.json` -> `meta/unicode.json`

> New datasets are relative to the `emojibase-data` package.

And the following datasets are no longer available. Please use one of the datasets mentioned
previously.

* `data/compact/by-category.json`
* `data/compact/map.json`
* `data/expanded/by-category.json`
* `data/expanded/map.json`
* `data/extra/hexcode-to-shortname.json`
* `data/extra/shortname-to-unicode.json`
* `data/standard/by-category.json`
* `data/standard/list.json`
* `data/standard/map.json`

## Data Structure Changes

The structure of emoji objects found within datasets have drastically changed.
The new structure includes additional data, while reducing the filesize by using
integer values when applicable.

The old structure looked like so:

```
{
  category: string,
  codepoint: number[],
  display: 'text' | 'emoji',
  emoji: string,
  gender: 'female' | 'male',
  hexcode: string,
  name: string,
  order: number,
  skin: number,
  shortnames: string[],
  tags: string[],
  text: string,
}
```

While the new structure looks like ([type definitions][typedefs] and [constants][consts]
are available):

```
{
  annotation: string,
  emoji: string,
  emoticon: string,
  gender: Gender,
  group: number,
  hexcode: string,
  name: string,
  order: number,
  shortcodes: string[],
  skins: Emoji[],
  subgroup: number,
  tags: string[],
  text: string,
  tone: SkinTone,
  type: Presentation,
}
```

For reference, the following properties were renamed.

* `category` -> `group`
* `display` -> `type`
* `skin` -> `tone`
* `shortnames` -> `shortcodes`

And the `codepoint` property was removed. Use the `fromHexcodeToCodepoint` function instead.

## Regex Changes

All the previous regex patterns are exactly the same, but are now located in the
`emojibase-regex` package. The only breaking change are the relocation of Unicode codepoint
regex patterns, which are now located in the `codepoint` folder, instead of `es`.

* `regex/es/index.js` -> `codepoint/index.js`
* `regex/es/emoji.js` -> `codepoint/emoji.js`
* `regex/es/text.js` -> `codepoint/text.js`

> Regex patterns are relative to the `emojibase-regex` package.

## Function Changes

Helper functions were moved to the `emojibase` package, and a few of them were renamed during
this refactor. They are:

* `fromHexToCodepoint` -> `fromHexcodeToCodepoint`
* `fromUnicodeToHex` -> `fromUnicodeToHexcode`

[consts]: https://github.com/milesj/emojibase/blob/master/packages/emojibase/src/constants.js
[typedefs]: https://github.com/milesj/emojibase/blob/master/packages/emojibase/emojibase.js.flow
