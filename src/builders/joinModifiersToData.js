/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

import {
  LIGHT_SKIN,
  LIGHT_SKIN_MODIFIER,
  MEDIUM_LIGHT_SKIN,
  MEDIUM_LIGHT_SKIN_MODIFIER,
  MEDIUM_SKIN,
  MEDIUM_SKIN_MODIFIER,
  MEDIUM_DARK_SKIN,
  MEDIUM_DARK_SKIN_MODIFIER,
  DARK_SKIN,
  DARK_SKIN_MODIFIER,
  SKIN_MODIFIER_PATTERN,
  EMOJI_VARIATION_SELECTOR,
} from '../../packages/emojibase/lib/constants';
import hasProperty from '../helpers/hasProperty';
import extractSkinTone from '../parsers/extractSkinTone';

import type { SkinTone } from '../types';

const SKIN_HEXCODE_PATTERN: RegExp = new RegExp(`-(${SKIN_MODIFIER_PATTERN.source})`, 'g');

const SKIN_MODIFIERS: { [tone: SkinTone]: string } = {
  [LIGHT_SKIN]: LIGHT_SKIN_MODIFIER, // 1
  [MEDIUM_LIGHT_SKIN]: MEDIUM_LIGHT_SKIN_MODIFIER, // 2
  [MEDIUM_SKIN]: MEDIUM_SKIN_MODIFIER, // 3
  [MEDIUM_DARK_SKIN]: MEDIUM_DARK_SKIN_MODIFIER, // 4
  [DARK_SKIN]: DARK_SKIN_MODIFIER, // 5
};

export default function joinModifiersToData(emojis: Object) {
  Object.keys(emojis).forEach((hexcode) => {
    const emoji = emojis[hexcode];

    // Handle appending a skin tone modification
    const addModification = (parent, mod) => {
      if (!parent.modifications) {
        parent.modifications = {};
      }

      if (parent.modifications[mod.tone]) {
        parent.modifications[mod.tone] = {
          ...parent.modifications[mod.tone],
          ...mod,
        };
      } else {
        parent.modifications[mod.tone] = mod;
      }
    };

    // Merge Emoji_ZWJ_Sequence and Emoji_Modifier_Sequence emojis into their parent
    if (
      hasProperty(emoji.property, ['Emoji_ZWJ_Sequence', 'Emoji_Modifier_Sequence']) &&
      hexcode.match(SKIN_MODIFIER_PATTERN)
    ) {
      const parentHexcode = hexcode.replace(SKIN_HEXCODE_PATTERN, '');
      const parentHexcodeWithVariation = hexcode.replace(
        SKIN_MODIFIER_PATTERN,
        EMOJI_VARIATION_SELECTOR,
      );

      // Some ZWJ parent emoji can easily be found by removing their skin tone modifier:
      // 1F468 1F3FB 200D 2695 FE0F -> 1F468 200D 2695 FE0F
      // While others need to replace their skin tone modifier with the emoji variation selector:
      // 26F9 1F3FB 200D 2640 FE0F -> 26F9 FE0F 200D 2640 FE0F
      const parentEmoji = emojis[parentHexcode] || emojis[parentHexcodeWithVariation];

      addModification(parentEmoji, {
        ...emoji,
        tone: extractSkinTone(emoji.name),
      });

      // Remove the modification from the root
      delete emojis[hexcode];

    // Generate Emoji_Modifier_Base modifications manually
    } else if (hasProperty(emoji.property, ['Emoji_Modifier_Base'])) {
      Object.keys(SKIN_MODIFIERS).forEach((skinTone) => {
        // $FlowIgnore
        const mod = emojis[SKIN_MODIFIERS[skinTone]];

        addModification(emoji, {
          name: `${emoji.name}, ${mod.name}`,
          hexcode: `${emoji.hexcode}-${mod.hexcode}`,
          tone: parseFloat(skinTone),
        });
      });
    }
  });
}
