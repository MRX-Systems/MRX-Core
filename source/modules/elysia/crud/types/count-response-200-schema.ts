import type { TNumber, TObject, TString } from '@sinclair/typebox/type';

export type CountResponse200Schema = TObject<{message: TString; content: TNumber;}>;