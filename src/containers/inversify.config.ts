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
import { LoggingService } from '../services/loggingService';

const container = new Container();

container.bind<ILineRepository>(TYPES.LineRepository).to(LineRepository);
container.bind<ILineService>(TYPES.LineService).to(LineService);
container.bind<ISweetsApiRepository>(TYPES.SweetsApiRepository).to(SweetsApiRepository);
container.bind<ISweetsApiService>(TYPES.SweetsApiService).to(SweetsApiService);
container.bind<ISweetsRepository>(TYPES.SweetsRepository).to(SweetsRepository);
container.bind<ISweetsService>(TYPES.SweetsService).to(SweetsService);
container.bind<LoggingService>(TYPES.LoggingService).to(LoggingService);

export { container };
