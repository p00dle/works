import type { AllKeyValues } from '~/types/key-values';

import { initialKeyValues } from '~/types/key-values';

import { keyValueStoreFactory } from 'works';
import { dbKeyValueStore as baseKeyValueStore } from '~/components/key-value';
// import { inMemoryKeyValueStore as baseKeyValueStore } from 'works';

export const keyValueStore = keyValueStoreFactory<AllKeyValues>(baseKeyValueStore, initialKeyValues)

