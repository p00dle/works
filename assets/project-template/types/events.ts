import type { KeyValueEvents } from '~/components/key-value/events'
// @works:next_import

export type AllEvents = 
  & { }
  & KeyValueEvents
  // @works:next_value
;
