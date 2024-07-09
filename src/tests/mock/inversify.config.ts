import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '../../containers/inversify.types';
import { MockLineRepository } from './lineRepository';
import { ILineRepository } from '../../repositories/lineRepository';

const mockDiContainer = new Container();

mockDiContainer.bind<ILineRepository>(TYPES.LineRepository).to(MockLineRepository);

export { mockDiContainer };
