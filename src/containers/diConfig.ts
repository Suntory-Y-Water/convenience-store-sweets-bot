import { ILineRepository } from '../interfaces/lineInterface';
import { LineRepository } from '../repositories/lineRepository';
import { ILineService, LineService } from '../services/lineService';
import { ISweetsApiRepository } from '../interfaces/sweetsApiInterface';
import { ISweetsRepository } from '../interfaces/sweetsInterface';
import { SweetsApiRepository } from '../repositories/sweetsApiRepository';
import { SweetsRepository } from '../repositories/sweetsRepository';
import { SweetsService, ISweetsService } from '../services/sweetsService';
import { SweetsApiService, ISweetsApiService } from '../services/sweetsApiService';
import { DIContainer } from './diContainer';

export interface DependencyTypes {
  LineService: ILineService;
  LineRepository: ILineRepository;
  SweetsService: ISweetsService;
  SweetsRepository: ISweetsRepository;
  SweetsApiService: ISweetsApiService;
  SweetsApiRepository: ISweetsApiRepository;
}

const diContainer = new DIContainer<DependencyTypes>();

diContainer.register('LineRepository', LineRepository);
diContainer.register('LineService', LineService, diContainer.get('LineRepository'));

diContainer.register('SweetsRepository', SweetsRepository);
diContainer.register('SweetsService', SweetsService, diContainer.get('SweetsRepository'));

diContainer.register('SweetsApiRepository', SweetsApiRepository);
diContainer.register(
  'SweetsApiService',
  SweetsApiService,
  diContainer.get('SweetsApiRepository'),
);

export { diContainer };
