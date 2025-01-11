// app/portfolio/[page]/page.tsx
export function generateStaticParams() {
    return [
      { page: 'development' },
      { page: 'archived' },
      { page: 'cgi' },
      { page: 'print-design' }
    ]
  }
  
  export default function PortfolioPage({ params }: { params: { page: string } }) {
    return <div>Portfolio Page: {params.page}</div>
  }