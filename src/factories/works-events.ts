import * as events from 'events';
import { WorksEvents } from '../types/works-events';
import { eventsFactory } from './events';

export const worksEvents = eventsFactory<WorksEvents>(new events.EventEmitter())