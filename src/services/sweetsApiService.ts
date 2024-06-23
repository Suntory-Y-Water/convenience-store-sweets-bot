import { Sweets } from '../model/sweets';
import { GetSweetsDetailParams } from '../model/sweetsApi';
import { ISweetsApiRepository } from '../repositories/sweetsApiRepository';

export interface ISweetsApiService {
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
  getSweetsDetail(params: GetSweetsDetailParams): Promise<Sweets[]>;
}

export class SweetsApiService implements ISweetsApiService {
  private sweetsApiRepository: ISweetsApiRepository;
  constructor(sweetsApiRepository: ISweetsApiRepository) {
    this.sweetsApiRepository = sweetsApiRepository;
  }

  fetchSweetsUrl = async (
    url: string,
    headers?: Record<string, string>,
  ): Promise<string> => {
    return await this.sweetsApiRepository.fetchTextResponse(url, headers);
  };

  parseName(text: string): string {
    return text
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();
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

  getSweetsDetail = async (params: GetSweetsDetailParams): Promise<Sweets[]> => {
    try {
      const results: Sweets[] = [];
      let currentProduct: Sweets = {
        itemName: '',
        itemPrice: '',
        itemImage: '',
        itemHref: '',
        storeType: params.storeType,
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
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      return [];
    }
  };
}
