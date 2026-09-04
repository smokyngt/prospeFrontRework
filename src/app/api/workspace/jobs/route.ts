import { fetchResource } from '../resource';

export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => fetchResource('jobs', request.url);
