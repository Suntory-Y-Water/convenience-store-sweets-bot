import { decode } from 'html-entities';
import { TYPES } from '../containers/inversify.types';
import { ISweetsApiRepository } from '../repositories/sweetsApiRepository';
import { GetSweetsDetailParams, ReleasePeriod, Sweets } from '../types';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ParseException } from '../utils/exceptions';
export interface ISweetsApiService {
  /**
   *
   * @description 指定されたURLからhtmlを取得する
   * @param {string} url
   * @param {Record<string, string>} [headers]
   * @return {*}  {Promise<string>}
   * @memberof ISweetsApiService
   */
  fetchSweetsUrl(url: string, headers?: Record<string, string>): Promise<string>;
  /**
   *
   * @description htmlのテキストをパースして商品名を取得する
   * @param {string} text
   * @return {*}  {string}
   * @memberof SweetsApiService
   */
  parseName(text: string): string;
  parsePrice(text: string): string;
  parseImage(element: Element, baseUrl: string, storeType: string): string;
  parseHref(element: Element, baseUrl: string, storeType: string): string;

  /**
   *
   * @description テキスト化したhtmlから商品情報を抽出してする
   * @param {GetSweetsDetailParams} params
   * @return {*}  {Promise<Sweets[]>}
   * @memberof ISweetsApiService
   */
  getSweetsDetail(params: GetSweetsDetailParams): Promise<Sweets[]>;
  /**
   *
   * @description クラスが存在するかどうかを判定する
   * @param {Element} element
   * @param {string} className
   * @memberof SweetsApiService
   */
  hasClass(element: Element, className: string): boolean;

  /**
   *
   * @description テキストを受け取り、商品が新商品かどうかを判定する
   * @param {string} text
   * @return {*}  {{
   *     isNew?: boolean;
   *     releasePeriod?: ReleasePeriod;
   *   }}
   * @memberof ISweetsApiService
   */
  isNewProductTextString(text: string): {
    isNew?: boolean;
    releasePeriod?: ReleasePeriod;
  };

  /**
   *
   * @description Elementを受け取り、商品が新商品かどうかを判定する
   * @param {Element} element
   * @return {*}  {{
   *     isNew?: boolean;
   *     releasePeriod?: ReleasePeriod;
   *   }}
   * @memberof ISweetsApiService
   */
  isNewProductElement(element: Element): {
    isNew?: boolean;
    releasePeriod?: ReleasePeriod;
  };
}

@injectable()
export class SweetsApiService implements ISweetsApiService {
  constructor(
    @inject(TYPES.SweetsApiRepository) private sweetsApiRepository: ISweetsApiRepository,
  ) {}
  fetchSweetsUrl = async (
    url: string,
    headers?: Record<string, string>,
  ): Promise<string> => {
    return await this.sweetsApiRepository.fetchTextResponse(url, headers);
  };

  parseName(text: string): string {
    return decode(text).trim();
  }

  parsePrice(text: string): string {
    return text.replace(/\r\n\s+/g, '').trim();
  }

  parseImage(element: Element, baseUrl: string, storeType: string): string {
    const image = element.getAttribute('data-original') || element.getAttribute('src');
    if (!image) {
      return '';
    }
    return storeType === 'SevenEleven' ? image : baseUrl + image;
  }

  parseHref(element: Element, baseUrl: string, storeType: string): string {
    const href = element.getAttribute('href');
    if (!href) {
      return '';
    }
    return storeType === 'FamilyMart' ? href : baseUrl + href;
  }

  hasClass = (element: Element, className: string): boolean => {
    const classes = element.getAttribute('class');
    return classes ? classes.includes(className) : false;
  };

  // TODO: あまりこの実装は美しくない
  isNewProductElement = (
    element: Element,
  ): { isNew?: boolean; releasePeriod?: ReleasePeriod } => {
    if (this.hasClass(element, 'ly-icn-soon')) {
      return { isNew: true, releasePeriod: 'next_week' };
    } else if (this.hasClass(element, 'ly-icn-new')) {
      return { isNew: true, releasePeriod: 'this_week' };
    }
    return {};
  };

  // TODO: あまりこの実装は美しくない
  isNewProductTextString = (
    text: string,
  ): { isNew?: boolean; releasePeriod?: ReleasePeriod } => {
    if (text.includes('以降順次発売')) {
      return { isNew: true, releasePeriod: 'this_week' };
    }
    if (text.includes('新発売')) {
      return { isNew: true, releasePeriod: 'this_week' };
    }
    const nextWeekMatch = text.match(/(\d{1,2})月(\d{1,2})日発売/);
    if (nextWeekMatch) {
      return { isNew: true, releasePeriod: 'next_week' };
    }
    return {};
  };

  getSweetsDetail = async (params: GetSweetsDetailParams): Promise<Sweets[]> => {
    try {
      const results: Sweets[] = [];
      let currentProduct: Sweets = {
        itemName: '',
        itemPrice: '',
        itemImage: '',
        itemHref: '',
        storeType: params.storeType,
        metadata: {},
      };

      const rewriter = new HTMLRewriter()
        .on(params.baseSelector, {
          element() {
            if (
              currentProduct.itemName ||
              currentProduct.itemPrice ||
              currentProduct.itemImage
            ) {
              results.push(currentProduct);
              currentProduct = {
                itemName: '',
                itemPrice: '',
                itemImage: '',
                itemHref: '',
                storeType: params.storeType,
                metadata: {},
              };
            }
          },
        })
        .on(params.baseSelector + params.itemNameSelector, {
          text: (text) => {
            currentProduct.itemName += this.parseName(text.text);
          },
        })
        .on(params.baseSelector + params.itemPriceSelector, {
          text: (text) => {
            currentProduct.itemPrice += this.parsePrice(text.text);
          },
        })
        .on(params.baseSelector + params.itemImageSelector, {
          element: (element) => {
            currentProduct.itemImage = this.parseImage(
              element,
              params.baseUrl,
              params.storeType,
            );
          },
        })
        .on(params.baseSelector + params.itemHrefSelector, {
          element: (element) => {
            currentProduct.itemHref = this.parseHref(
              element,
              params.baseUrl,
              params.storeType,
            );
          },
        })
        .on(params.baseSelector + params.itemLaunchSelector, {
          element: (element) => {
            if (params.storeType === 'FamilyMart' && !currentProduct.metadata?.isNew) {
              currentProduct.metadata = this.isNewProductElement(element);
            }
          },
          text: (text) => {
            if (
              (params.storeType === 'Lawson' || params.storeType === 'SevenEleven') &&
              !currentProduct.metadata?.isNew
            ) {
              currentProduct.metadata = this.isNewProductTextString(text.text);
            }
          },
        });
      const response = new Response(params.responseHtml);
      await rewriter.transform(response).arrayBuffer();
      // 最後の商品が保存されていない場合はここで保存
      if (
        currentProduct.itemName ||
        currentProduct.itemPrice ||
        currentProduct.itemImage
      ) {
        results.push(currentProduct);
      }
      return results;
    } catch {
      throw new ParseException(
        500,
        `Failed to parse html. Failed to parse html. The failed store is ${params.storeType}`,
      );
    }
  };
}
