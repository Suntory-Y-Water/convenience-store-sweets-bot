import { container } from '../../containers/inversify.config';
import { TYPES } from '../../containers/inversify.types';
import { ILineService } from '../../services/lineService';

describe('lineService', () => {
  let lineService: ILineService;
  beforeAll(() => {
    lineService = container.get(TYPES.LineService);
  });

  test('switchStoreType tests ◯◯のスイーツの場合、セブンイレブンとスイーツが返却される', () => {
    const sevenElevenMessage = lineService.switchStoreType('セブンのスイーツ');
    expect(sevenElevenMessage.store).toBe('SevenEleven');
    expect(sevenElevenMessage.productType).toBe('randomSweets');
  });
  test('switchStoreType tests 存在しないコンビニの場合はnullが返却される', () => {
    const sevenElevenMessage = lineService.switchStoreType('ミニストップのスイーツ');
    expect(sevenElevenMessage.store).toBe(null);
    expect(sevenElevenMessage.productType).toBe('randomSweets');
  });
  test('switchStoreType tests ◯◯の新商品の場合、◯◯(コンビニ名)とnewProductsが返却される', () => {
    const sevenElevenMessage = lineService.switchStoreType('ファミマの新商品');
    expect(sevenElevenMessage.store).toBe('FamilyMart');
    expect(sevenElevenMessage.productType).toBe('newProducts');
  });
  test('switchStoreType tests 全く関係ないメッセージの場合、両方ともnullが返却される', () => {
    const sevenElevenMessage = lineService.switchStoreType('あいうえお');
    expect(sevenElevenMessage.store).toBe(null);
    expect(sevenElevenMessage.productType).toBe(null);
  });
});
