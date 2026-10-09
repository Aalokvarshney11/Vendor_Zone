// Subtle CSS grid background component
export default function GridBackground({ children, className = "" }) {
  return (
    <div className={`relative min-h-screen bg-slate-50 text-slate-900 ${className}`}>
      {/* CSS grid overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
