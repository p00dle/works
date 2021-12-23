import { OnUpdateDeleteAction } from '../../types/table';

export const foreignKeyActionSqlMap: Record<OnUpdateDeleteAction, string> = {
  'no-action': 'NO ACTION',
  'restrict': 'RESTRICT',
  'cascade': 'CASCADE',
  'set-null': 'SET NULL',
  'set-default': 'SET DEFAULT'
}