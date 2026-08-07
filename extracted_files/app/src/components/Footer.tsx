import { Link } from 'react-router';
import { DIMENSIONS } from '@/data/dimensions';

export default function Footer() {
  return (
    <footer className="border-t border-line-hair bg-base">
      <div className="mx-auto max-w-container px-[clamp(20px,4vw,48px)] py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/assets/logo.svg" alt="COPACETIC logo" width={24} height={24} />
              <span className="font-mono text-sm font-bold tracking-[0.32em] text-ink-hi">COPACETIC</span>
            </div>
            <p className="mt-4 font-display text-lg italic text-ink-hi">
              It&rsquo;s not the model. It&rsquo;s the way you work.
            </p>
            <p className="mt-4 text-mono-sm text-ink-low">
              Simulated recreations of documented AI behavior. Not affiliated with OpenAI,
              Anthropic, Google, xAI, Alibaba, DeepSeek, or Moonshot AI.
            </p>
          </div>

          <div>
            <p className="text-label text-ink-low">Pages</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="text-ink-mid transition-colors hover:text-ink-hi" to="/simulator">Simulator</Link></li>
              <li><Link className="text-ink-mid transition-colors hover:text-ink-hi" to="/models">Model Profiles</Link></li>
              <li><Link className="text-ink-mid transition-colors hover:text-ink-hi" to="/results">Results</Link></li>
              <li><Link className="text-ink-mid transition-colors hover:text-ink-hi" to="/method">Method &amp; Sources</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-label text-ink-low">Data stays in your browser &middot; localStorage only</p>
            <Link to="/method" className="mt-4 inline-block text-sm text-ice hover:underline">
              Method &amp; Sources &rarr;
            </Link>
            <p className="mt-6 text-label text-ink-low">Dimension index</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {DIMENSIONS.map((d) => (
                <li key={d.id} className="text-mono-sm text-ink-low">
                  <span className="text-human">{d.short}</span> {d.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-line-hair pt-6">
          <p className="text-mono-sm text-ink-low">
            COPACETIC &copy; 2026 &middot; Built on published research &middot; No quizzes were harmed.
          </p>
        </div>
      </div>
    </footer>
  );
}
