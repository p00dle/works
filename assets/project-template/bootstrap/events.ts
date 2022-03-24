import type { AllEvents } from '~/types/events';

import { logger } from '~/bootstrap/logger';
import { eventsFactory } from 'works';

import { singleInstanceEvents } from 'works';
const baseEventEmitter = singleInstanceEvents;

// import { pgEventsFactory } from 'works';
// import { databaseUrl } from '~/bootstrap/global-env-vars';
// const baseEventEmitter = pgEventsFactory(databaseUrl);

export const events = eventsFactory<AllEvents>(baseEventEmitter, logger);
