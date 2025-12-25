import { Navigation } from './navigation';
import { MAIN_CATEGORIES } from '@/lib/constants/categories';

/**
 * Server component wrapper that fetches categories and passes them to Navigation
 */
export async function NavigationWrapper() {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/349c6429-fdf5-4459-8ed5-e0d69f4124fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation-wrapper.tsx:8',message:'NavigationWrapper called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  // Lazy import prisma to avoid module evaluation error if DATABASE_URL is missing
  let prisma: any;
  try {
    const dbModule = await import('@nursery/db');
    prisma = dbModule.prisma;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/349c6429-fdf5-4459-8ed5-e0d69f4124fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation-wrapper.tsx:14',message:'prisma imported successfully',data:{hasPrisma:!!prisma},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/349c6429-fdf5-4459-8ed5-e0d69f4124fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'navigation-wrapper.tsx:18',message:'Failed to import prisma, returning fallback',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#2d5016]">The Plant Nursery</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: {
        name: { in: MAIN_CATEGORIES },
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    // #region agent log
    console.error('[DEBUG] navigation-wrapper.tsx Database query succeeded', JSON.stringify({count:categories.length}));
    // #endregion
  } catch (dbError: any) {
    // #region agent log
    console.error('[DEBUG] navigation-wrapper.tsx Database error', JSON.stringify({error:dbError?.message}));
    // #endregion
    // Return empty navigation if database fails
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#2d5016]">The Plant Nursery</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Deduplicate by name (keep first occurrence)
  const seen = new Set<string>();
  const uniqueCategories = categories.filter(cat => {
    if (seen.has(cat.name)) {
      return false;
    }
    seen.add(cat.name);
    return true;
  });

  // #region agent log
  console.error('[DEBUG] navigation-wrapper.tsx:35 About to render Navigation', JSON.stringify({categoriesCount:uniqueCategories.length,firstCategory:uniqueCategories[0]?{name:uniqueCategories[0].name,slug:uniqueCategories[0].slug}:null}));
  // #endregion

  try {
    return <Navigation categories={uniqueCategories} />;
  } catch (error: any) {
    console.error('[DEBUG] navigation-wrapper.tsx ERROR rendering Navigation', JSON.stringify({error:error?.message,stack:error?.stack}));
    // Return fallback navigation instead of throwing
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#2d5016]">The Plant Nursery</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

