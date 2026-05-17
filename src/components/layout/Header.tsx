'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Users, User, Home, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const nav = [
  { href: '/', label: 'Главная', icon: <Home size={16} /> },
  { href: '/play', label: 'Играть', icon: null },
  { href: '/multiplayer', label: 'Мультиплеер', icon: <Users size={16} /> },
  { href: '/leaderboard', label: 'Рейтинг', icon: <Trophy size={16} /> },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 1557 1211" className="w-full h-full" fill="white">
              <path fillRule="evenodd" clipRule="evenodd" d="M1172.7 1.79011C1155.62 6.63721 1143.36 17.2985 1133.69 35.7047C1129.17 44.2923 1128.52 47.6745 1128.51 62.5005C1128.49 77.5603 1129.11 80.6993 1134.03 90.4123C1142.68 107.472 1154.32 117.74 1171.85 123.775C1197.74 132.681 1226.18 124.054 1242.49 102.346C1252.71 88.7345 1256.47 76.0238 1255.26 59.1221C1252.85 25.215 1229.19 2.12191 1194.84 0.138571C1186.96 -0.315786 1177.68 0.376132 1172.7 1.79011ZM594.949 57.1444C591.838 57.5158 581.91 59.1823 572.887 60.8471L556.48 63.8768L556.427 155.097L556.374 246.317H652.488H748.601V151.11V55.902L674.603 56.1847C633.905 56.3393 598.06 56.7711 594.949 57.1444ZM944.237 155.823L944.744 246.317H1035.35H1125.96L1124.65 240.365C1093.24 159.405 1051.29 113.256 995.575 84.8036C978.374 76.02 966.758 71.1597 959.489 69.7061C956.482 69.1047 953.563 67.8736 953.005 66.9705C952.447 66.0675 950.132 65.3284 947.86 65.3284L943.729 65.3265L944.237 155.823ZM369.65 259.986C364.901 284.368 364.19 298.121 364.096 367.448L364 438.618H460.116H556.231L556.229 343.41L556.227 248.202H464.085H371.945L369.65 259.986ZM750.486 343.41V438.618H845.694H940.901V343.41V248.202H845.694H750.486V343.41ZM559.715 441.977C556.772 442.571 556.559 449.777 556.887 537.241L557.243 631.861L652.922 632.349L748.601 632.837V537.025V441.214L655.75 441.274C604.683 441.306 561.466 441.623 559.715 441.977ZM944.672 537.143V632.839L1035.42 632.351L1126.17 631.861L1128.75 621.782C1133.28 604.111 1135.06 571.365 1135.07 505.546L1135.09 441.446H1039.88H944.672V537.143ZM373.447 635.141C373.687 640.882 385.526 671.559 392.919 685.592C419.317 735.701 456.819 772.566 506.981 797.716C516.342 802.411 524.528 806.251 525.172 806.251C525.815 806.251 529.903 807.84 534.252 809.784C538.601 811.726 545.319 813.881 549.178 814.573L556.195 815.828L555.776 725.73L555.358 635.631L464.392 635.141C414.36 634.873 373.436 634.873 373.447 635.141ZM751.744 635.946C751.052 636.636 750.486 679.48 750.486 731.154V825.104H824.641C867.741 825.104 903.467 824.28 909.951 823.137C935.044 818.713 940.903 817.187 940.952 815.07C940.999 812.985 940.977 669.101 940.926 645.529L940.901 634.689H846.951C795.277 634.689 752.434 635.254 751.744 635.946Z" fill="#f59e0b"/>
            </svg>
          </div>
          <span className="font-black text-white text-lg tracking-wide group-hover:text-amber-400 transition-colors">
            CHECKERS
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/50"
          >
            <User size={15} />
            Войти
          </Link>
          <Link
            href="/play"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20"
          >
            Играть
          </Link>
        </div>
      </div>
    </header>
  );
}
