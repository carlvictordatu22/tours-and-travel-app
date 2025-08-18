import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
    // Do not prerender the parameterized route; let it render client-side (or on server at runtime if configured)
    {
        path: 'location-search/:location',
        renderMode: RenderMode.Server
    },
    {
        path: '**',
        renderMode: RenderMode.Prerender
    }
];
