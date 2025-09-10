import type { TNumber, TObject, TString, TUnion } from '@sinclair/typebox/type';

export type IdParamSchema = TObject<{ id: TUnion<[TString, TNumber]> }>;