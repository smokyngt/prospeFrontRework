import { fetchResource } from '../resource';

export const dynamic = 'force-dynamic';

export const GET = async (request: Request) => fetchResource('team', request.url);
