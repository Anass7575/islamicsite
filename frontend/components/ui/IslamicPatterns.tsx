export const IslamicPatterns = {
  // Eight-pointed star pattern
  StarPattern: () => (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      className="text-emerald-deep opacity-5"
      aria-hidden="true"
    >
      <defs>
        <pattern id="star-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <g fill="currentColor">
            <path d="M50 0l10.5 39.5H100L69.5 64l10.5 36L50 75.5L19.5 100l10.5-36L0 39.5h39.5z" />
            <path d="M50 25l6.2 18.8H75l-15.2 11.1 5.8 17.9L50 61.6l-15.6 11.2 5.8-17.9L25 43.8h18.8z" opacity="0.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#star-pattern)" />
    </svg>
  ),

  // Geometric tessellation
  GeometricPattern: () => (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className="text-gold-soft opacity-3"
      aria-hidden="true"
    >
      <defs>
        <pattern id="geometric" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="0.5">
            <polygon points="25,0 50,25 25,50 0,25" />
            <polygon points="25,10 40,25 25,40 10,25" />
            <circle cx="25" cy="25" r="5" fill="currentColor" opacity="0.2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#geometric)" />
    </svg>
  ),

  // Arabesque pattern
  ArabesquePattern: () => (
    <svg
      width="150"
      height="150"
      viewBox="0 0 150 150"
      className="text-emerald-deep opacity-4"
      aria-hidden="true"
    >
      <defs>
        <pattern id="arabesque" x="0" y="0" width="75" height="75" patternUnits="userSpaceOnUse">
          <g fill="currentColor">
            <path d="M37.5,0 Q56.25,18.75 37.5,37.5 Q18.75,56.25 0,37.5 Q18.75,18.75 37.5,0z" />
            <path d="M75,37.5 Q56.25,56.25 37.5,37.5 Q56.25,18.75 75,37.5z" />
            <path d="M37.5,75 Q18.75,56.25 37.5,37.5 Q56.25,56.25 37.5,75z" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arabesque)" />
    </svg>
  ),

  // Calligraphy ornament
  CalligraphyOrnament: ({ className = "" }: { className?: string }) => (
    <svg
      viewBox="0 0 200 60"
      className={`w-full h-auto ${className}`}
      aria-hidden="true"
    >
      <g fill="currentColor">
        <path d="M20,30 Q40,10 60,30 T100,30 T140,30 T180,30" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              opacity="0.3" />
        <circle cx="100" cy="30" r="8" opacity="0.5" />
        <circle cx="100" cy="30" r="4" />
        <path d="M90,30 Q100,20 110,30" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              opacity="0.4" />
      </g>
    </svg>
  ),

  // Corner ornament
  CornerOrnament: ({ position = "top-left" }: { position?: string }) => {
    const rotation = {
      "top-left": "rotate(0)",
      "top-right": "rotate(90)",
      "bottom-right": "rotate(180)",
      "bottom-left": "rotate(270)"
    }[position] || "rotate(0)";

    return (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        className="absolute"
        style={{ transform: rotation }}
        aria-hidden="true"
      >
        <g fill="currentColor" opacity="0.2">
          <path d="M0,0 L20,0 Q0,20 0,0z" />
          <path d="M0,0 L30,0 Q0,30 0,0z" opacity="0.7" />
          <path d="M0,0 L40,0 Q0,40 0,0z" opacity="0.4" />
          <circle cx="15" cy="15" r="3" />
        </g>
      </svg>
    );
  },

  // Decorative frame
  DecorativeFrame: ({ children }: { children: React.ReactNode }) => (
    <div className="relative p-8">
      <div className="absolute inset-0 border-2 border-gold-soft/20 rounded-organic-lg" />
      <div className="absolute inset-2 border border-emerald-deep/10 rounded-organic" />
      
      {/* Corner ornaments */}
      <div className="absolute top-0 left-0 text-gold-soft">
        <IslamicPatterns.CornerOrnament position="top-left" />
      </div>
      <div className="absolute top-0 right-0 text-gold-soft">
        <IslamicPatterns.CornerOrnament position="top-right" />
      </div>
      <div className="absolute bottom-0 right-0 text-gold-soft">
        <IslamicPatterns.CornerOrnament position="bottom-right" />
      </div>
      <div className="absolute bottom-0 left-0 text-gold-soft">
        <IslamicPatterns.CornerOrnament position="bottom-left" />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  ),
};

// Bismillah component with proper styling
export const Bismillah = ({ className = "" }: { className?: string }) => (
  <div className={`bismillah ${className}`}>
    <span className="arabic-display">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
  </div>
);

// Decorative divider
export const OrnamentalDivider = ({ text = "◆◆◆" }: { text?: string }) => (
  <div className="divider-ornament">
    <span>{text}</span>
  </div>
);