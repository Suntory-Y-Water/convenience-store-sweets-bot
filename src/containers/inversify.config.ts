import 'reflect-metadata';
import { Container } from 'inversify';
import { ILineRepository, LineRepository } from '../repositories/lineRepository';
import { ILineService, LineService } from '../services/lineService';
import {
  ISweetsApiRepository,
  SweetsApiRepository,
} from '../repositories/sweetsApiRepository';
import { ISweetsRepository, SweetsRepository } from '../repositories/sweetsRepository';
import { SweetsService, ISweetsService } from '../services/sweetsService';
import { SweetsApiService, ISweetsApiService } from '../services/sweetsApiService';
import { TYPES } from './inversify.types';

const container = new Container();

container.bind<ILineRepository>(TYPES.LineRepository).to(LineRepository);
container.bind<ILineService>(TYPES.LineService).to(LineService);
container.bind<ISweetsApiRepository>(TYPES.SweetsApiRepository).to(SweetsApiRepository);
container.bind<ISweetsRepository>(TYPES.SweetsRepository).to(SweetsRepository);
container.bind<ISweetsService>(TYPES.SweetsService).to(SweetsService);
container.bind<ISweetsApiService>(TYPES.SweetsApiService).to(SweetsApiService);

export { container };
