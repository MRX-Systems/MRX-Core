import type { SinkBody } from './sink-body';

export type BodiesIntersection<TSinks, K extends keyof TSinks> = (
	K extends unknown
		? (object: SinkBody<TSinks, K>) => void
		: never
) extends (object: infer I) => void ? I : never;