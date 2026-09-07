export function WelcomeIllustration() {
  return (
    <div className="overflow-hidden rounded-[2rem] bg-[#edf7fb]">
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-label="Mediterranean seaside property illustration"
        className="block h-auto w-full"
      >
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#dff2fb" />
            <stop offset="1" stopColor="#f8fbfd" />
          </linearGradient>
          <linearGradient id="sea" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#9ed3ef" />
            <stop offset="1" stopColor="#68a8d4" />
          </linearGradient>
        </defs>
        <rect width="720" height="360" fill="url(#sky)" />
        <circle cx="528" cy="78" r="34" fill="#ffd9a5" />
        <path d="M0 190 C120 158 220 180 320 163 C430 143 510 174 720 138 L720 360 L0 360Z" fill="#b9ddec" />
        <path d="M0 212 C138 192 220 208 340 184 C470 158 588 187 720 158 L720 360 L0 360Z" fill="url(#sea)" />
        <path d="M0 238 C150 213 255 236 355 214 C474 189 589 216 720 188" fill="none" stroke="#e8f5fb" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        <path d="M0 278 C130 254 220 277 340 249 C466 221 575 256 720 227" fill="none" stroke="#d8eff9" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
        <g fill="#f8f5ed">
          <path d="M235 162 L325 108 L415 162 L415 255 L235 255Z" />
          <path d="M220 163 L325 94 L430 163 L416 180 L325 123 L234 180Z" />
        </g>
        <rect x="276" y="176" width="40" height="79" rx="2" fill="#86aeca" />
        <rect x="342" y="176" width="42" height="33" rx="2" fill="#8bb3cf" />
        <rect x="230" y="255" width="205" height="13" rx="6" fill="#c9a67d" />
        <g fill="#3f785d">
          <path d="M172 205 C162 168 173 137 193 113 C202 151 201 181 186 206Z" />
          <path d="M450 214 C446 173 459 143 480 120 C486 161 479 192 462 217Z" />
          <path d="M488 220 C486 184 499 160 519 144 C522 179 513 204 497 224Z" />
        </g>
        <g stroke="#e7d9c5" strokeWidth="3" opacity="0.9">
          <path d="M178 205 L180 242" />
          <path d="M457 213 L461 250" />
        </g>
        <path d="M116 302 C156 287 192 287 223 304 C191 319 150 320 116 302Z" fill="#d6e7ee" opacity="0.9" />
      </svg>
    </div>
  )
}
