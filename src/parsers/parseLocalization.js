/**
 * @copyright   2017, Miles Johnson
 * @license     https://opensource.org/licenses/MIT
 * @flow
 */

// $FlowIgnore Lazyiness
import cheerio from 'cheerio';

import type { CLDRDataMap } from '../types';

/**
 * Parses an official unicode CLDR XML datasource.
 *
 * Example:
 *  http://unicode.org/repos/cldr/tags/release-31-0-1/common/main/en.xml
 *  http://unicode.org/repos/cldr/tags/release-31-0-1/common/subdivisions/en.xml
 */
export default function parseLocalization(
  version: string,
  content: string,
  nodeName: string,
  attrName: string = 'type',
): CLDRDataMap {
  const xml = cheerio.load(content, { xmlMode: true });
  const data = {};

  xml(nodeName).each((i, rawRow) => {
    const row = xml(rawRow);

    data[row.attr(attrName)] = row.text().trim();
  });

  return data;
}
