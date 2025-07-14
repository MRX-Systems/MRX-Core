import type { TObject } from '@sinclair/typebox/type';

import type { CrudOperationBaseOptions } from './crudOperationBaseOptions';

export type CrudOperationFindOptions<TInferedObject extends TObject> = CrudOperationBaseOptions<TInferedObject>;
