import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static routes - prerender for performance
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'activities',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'hotels',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'restaurants',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'profile',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'ai-search',
    renderMode: RenderMode.Prerender
  },
  
  // Dynamic routes - server-side render
  {
    path: 'activities/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'hotels/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'restaurants/:id',
    renderMode: RenderMode.Server
  },
  
  // Catch-all for any other routes - prerender if possible
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
