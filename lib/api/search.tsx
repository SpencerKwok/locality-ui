import { distance } from "fastest-levenshtein";
import DoubleMetaphone from "doublemetaphone";

import type { Hit } from "@algolia/client-search";
import type { Product } from "common/Schema";
const encoder = new DoubleMetaphone();

/*
  Pick best variant from the hit to showcase.
  We do so by running double metaphone and
  using Levenshtein distancing algorithm
  on the resulting phonetics. We do not use
  Metaphone 3 (although better) due to
  licensing + it's $240 USD for source code.
*/
export const getBestVariant = (
  query: string,
  hit: Hit<Product>
): Hit<Product> => {
  const { variantImages, variantTags } = hit;
  const uniqueTags = new Map();
  const uniqueImages = new Set(variantImages);
  variantTags.forEach((tag, index) => {
    if (uniqueTags.has(tag)) {
      return;
    }
    uniqueTags.set(tag, index);
  });
  if (uniqueImages.size <= 1 || uniqueTags.size <= 1) {
    hit.variantIndex = 0;
  } else {
    const queryPhonetic = encoder.doubleMetaphone(query);
    const queryPhoneticString = `${queryPhonetic.primary}${queryPhonetic.alternate}`;
    const firstTagPhonetic = encoder.doubleMetaphone(variantTags[0]);
    const firstTagPhoneticString = `${firstTagPhonetic.primary}${firstTagPhonetic.alternate}`;
    let bestIndex = 0;
    let bestScore = distance(firstTagPhoneticString, queryPhoneticString);
    uniqueTags.forEach((index, tag) => {
      const phonetic = encoder.doubleMetaphone(tag);
      const phoneticString = `${phonetic.primary}${phonetic.alternate}`;
      const score = distance(phoneticString, queryPhoneticString);
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    hit.variantIndex = bestIndex;
  }
  return hit;
};
