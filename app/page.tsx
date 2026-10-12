'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BOOKING_WHATSAPP = `https://wa.me/919848034889?text=${encodeURIComponent(
  "Hi Neelima, I'd like to run a Game of Gambits session for our institution / team. Can we discuss?"
)}`
const BOOKING_EMAIL =
  'mailto:hello@nbbluestudios.com?subject=Game%20of%20Gambits%20session%20enquiry'

export default function HomePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('leads').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      source: 'landing_page',
      status: 'new',
      interested_in: 'Game of Gambits',
    })

    if (error) {
      setError('Something went wrong. Please try again.')
    } else {
      setSuccess(true)
      setForm({ name: '', email: '', phone: '' })
    }
    setLoading(false)
  }

  const faqs = [
    {
      q: 'What is Game of Gambits?',
      a: 'Game of Gambits is a live strategic decision simulation built around cricket. Participants manage limited resources, bid for players, build a squad and compete through analysis, judgement and strategy.'
    },
    {
      q: 'How does the auction work?',
      a: 'Each manager gets 1000 points as their purse. Players are put up one by one with a 30-second bidding timer. You bid points to win players. The manager who builds the best squad and scores the most fantasy points across the IPL season wins.'
    },
    {
      q: 'Do I need cricket knowledge to play?',
      a: 'Basic knowledge helps, but the real game is strategy — managing your purse, reading other managers, and making smart bids. MBA students find this especially engaging as it mirrors real auction and resource allocation problems.'
    },
    {
      q: 'How many players can I buy?',
      a: 'Each squad must have a minimum of 11 players and maximum of 25. You must have at least 3 batters, 3 bowlers, 2 all-rounders and 1 wicket-keeper. Your purse must last the whole auction!'
    },
    {
      q: 'What is the Power Player feature?',
      a: 'Each manager can nominate Power Players who earn 2x points multiplier for the season. Choose wisely — your Power Player picks can make or break your season.'
    },
    {
      q: 'Is any real money involved?',
      a: 'No. Game of Gambits is an educational decision simulation played with virtual points only. There is no real money, betting or wagering of any kind.'
    },
    {
      q: 'Can we run it for our class, institution or company?',
      a: 'Yes. We run facilitated sessions for MBA and management programs, student clubs and corporate teams, with rules configured for your group and a debrief on the decisions made. Use the booking options on this page to get in touch.'
    },
    {
      q: 'How do I join?',
      a: 'Register your interest below. Our team will reach out with auction details, login credentials and the rules document before the auction date.'
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <a href="#" className="flex items-center gap-2.5">
          <img src="/game-of-gambits-icon.svg" alt="" className="h-8 w-8" />
          <span className="font-black tracking-wide text-white text-base">
            GAME OF <span className="text-amber-400">GAMBITS</span>
          </span>
        </a>

        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="text-zinc-500 hover:text-white text-sm transition-colors hidden md:block">How it works</a>
          <a href="#institutions" className="text-zinc-500 hover:text-white text-sm transition-colors hidden md:block">For Institutions</a>
          <a href="#faq" className="text-zinc-500 hover:text-white text-sm transition-colors hidden md:block">FAQ</a>
          <a href="#register" className="text-zinc-500 hover:text-white text-sm transition-colors hidden md:block">Register Interest</a>
          <Link href="/login" className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            Sign In →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-8 pb-16 md:pt-12 md:pb-24 text-center max-w-5xl mx-auto">
      <img
        src="/game-of-gambits-icon.svg"
        alt="Game of Gambits"
        className="mx-auto mb-4 h-14 w-14 md:h-16 md:w-16 drop-shadow-[0_0_40px_rgba(251,191,36,0.25)]"
      />
      <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-6">
  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
  <span className="text-amber-400 text-xs font-medium tracking-wider uppercase">
    Strategic Decision Simulation
  </span>
</div>

<h1 className="text-5xl md:text-7xl font-black mb-5 leading-none tracking-tight">
  Think.
  <br />
  <span className="text-amber-400">Decide.</span>
  <br />
   Compete.
</h1>

<p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
  Manage limited resources, make strategic choices and build your winning squad.
  Game of Gambits turns cricket into a live decision-making experience.
</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#register"
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            Register Your Interest →
          </a>
          <a href="#institutions"
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
            For Institutions & Teams
          </a>
        </div>

        <p className="text-zinc-500 text-sm mt-6">
          An educational decision simulation played with virtual points. No real money or betting involved.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-20 max-w-2xl mx-auto">
          {[
            { value: 'LIVE', label: 'Competitive Bidding' },
            { value: '1000', label: 'Points Purse' },
            { value: '30s', label: 'Decision Timer' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-black text-amber-400 mb-1">{stat.value}</p>
              <p className="text-zinc-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-3">How It Works</h2>
          <p className="text-zinc-500">Three steps from strategy to victory</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Join the Auction',
              description: 'Get your points purse and compete in a live auction room with other managers. Bid strategically across different player tiers while managing limited resources.',
              icon: '🏏',
            },
            {
              step: '02',
              title: 'Build Your Squad',
              description: 'Strategically bid on batters, bowlers, all-rounders and wicket-keepers. Manage your purse wisely — every point counts. Nominate Power Players for 2x scoring.',
              icon: '⚡',
            },
            {
              step: '03',
              title: 'Win the League',
              description: 'Track your squad performance and compete on the leaderboard. The decisions you make during the game determine how effectively you use your resources.',
              icon: '🏆',
            },
          ].map((item) => (
            <div key={item.step} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <div className="absolute top-4 right-4 text-zinc-800 text-6xl font-black group-hover:text-zinc-700 transition-colors">
                {item.step}
              </div>
              <p className="text-4xl mb-4">{item.icon}</p>
              <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 py-20 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Why Game of Gambits?</h2>
            <p className="text-zinc-500">Built for strategy, competition and smarter decisions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '⚡', title: 'Real-time Live Auction', desc: 'Bid simultaneously with all managers in a live auction room. 30-second timer per player keeps the energy high.' },
              { icon: '🧠', title: 'Pure Strategy', desc: 'Manage your purse across a structured player pool. Reserve enough for mandatory squad slots. Outsmart your opponents with smart decisions.' },
              { icon: '🎯', title: 'Power Players', desc: 'Nominate key players for 2x points multiplier. One smart Power Player pick can change your entire season.' },
              { icon: '📊', title: 'Live Leaderboard', desc: 'Track rankings and performance as the competition progresses. See how your strategic choices compare with other managers.' },
              { icon: '🔄', title: 'Dynamic Rules', desc: 'Each auction group can customise rules — player classes, purse size, squad limits. Fully flexible for any group size.' },
              { icon: '🏏', title: 'Structured Player Pool', desc: 'Players are organised across configurable tiers and base values, creating different strategic choices in every game.' },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Institutions & Corporates */}
      <section id="institutions" className="relative px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-5">
            <span className="text-amber-400 text-xs font-medium tracking-wider uppercase">
              For Institutions &amp; Corporates
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">Decision training that people remember</h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            A facilitated simulation for classrooms and teams. Participants make real trade-offs under
            pressure, then review what their decisions actually achieved.
          </p>
        </div>

        {/* Live session video */}
        <div className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-8 md:gap-12 items-center mb-14">
          <div className="mx-auto w-full max-w-[320px] rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-[0_0_60px_rgba(251,191,36,0.08)]">
            <video
              className="w-full h-auto block"
              controls
              playsInline
              preload="none"
              poster="/videos/game-of-gambits-poster.jpg"
            >
              <source src="/videos/game-of-gambits-session.mp4" type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
          <div className="text-center md:text-left">
            <p className="text-amber-400 text-xs font-medium tracking-wider uppercase mb-3">From a live session</p>
            <h3 className="text-2xl md:text-3xl font-black mb-4">See it in the room</h3>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Participants bid live against each other on their laptops, with every decision tested
              against a limited purse and a 30-second clock. The energy in the room comes from the
              strategy, not luck.
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Each session ends with a debrief: what did teams prioritise, where did they overspend,
              and what would they do differently?
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              title: 'What participants learn',
              items: [
                'Resource allocation under constraints',
                'Bidding strategy and competitive reasoning',
                'Risk, value and portfolio thinking',
                'Decisions under time pressure',
                'Reviewing outcomes with data',
              ],
            },
            {
              title: 'Session formats',
              items: [
                'Classroom session: live auction with a facilitated debrief',
                'League format: track squad performance across a tournament',
                'Corporate workshop: team-based strategy and decision training',
              ],
            },
            {
              title: 'Built for',
              items: [
                'MBA and management programs',
                'Corporate L&D and leadership teams',
                'Student clubs, fests and competitions',
                'Rules configured to your group size',
              ],
            },
          ].map((col) => (
            <div key={col.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
              <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-3 text-zinc-300 text-sm leading-relaxed">
                    <span className="text-amber-400 flex-shrink-0">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-400/10 to-transparent border border-amber-400/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-xl mb-1">Run Game of Gambits for your class or team</p>
            <p className="text-zinc-400 text-sm">Tell us your group size and dates, and we'll suggest a format.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a href={BOOKING_WHATSAPP} target="_blank" rel="noreferrer"
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-6 py-3 rounded-xl text-sm transition-colors text-center">
              Book via WhatsApp →
            </a>
            <a href={BOOKING_EMAIL}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors text-center">
              Email us
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative px-6 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Frequently Asked Questions</h2>
          <p className="text-zinc-500">Everything you need to know before joining</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-800/50 transition-colors"
              >
                <span className="text-white font-medium pr-4">{faq.q}</span>
                <span className={`text-amber-400 text-xl flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Register Interest */}
      <section id="register" className="relative px-6 py-20 max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Register Your Interest</h2>
          <p className="text-zinc-500">We'll reach out with session details soon. Get ready to strategise!</p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-green-400 font-bold text-xl mb-2">You're on the list!</p>
            <p className="text-zinc-500 text-sm">We'll reach out with session details soon. Get ready to strategise!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Your full name"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="your@email.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/50 text-black font-bold py-4 rounded-xl text-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Register Interest →'}
            </button>

            <p className="text-zinc-600 text-xs text-center">
              We'll only contact you about Game of Gambits sessions and participation.
            </p>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="relative border-t border-zinc-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/game-of-gambits-icon.svg" alt="" className="h-6 w-6" />
            <span className="font-bold tracking-wide text-zinc-300 text-sm">
              GAME OF <span className="text-amber-400">GAMBITS</span>
            </span>
          </div>
          <p className="text-zinc-600 text-sm text-center">
            An NB Simulation product · Powered by{' '}
            <a href="https://www.nbbluestudios.com/#platforms" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              NB Blue Studios
            </a>
          </p>
          <Link href="/login" className="text-zinc-500 hover:text-white text-sm transition-colors">
            Sign In →
          </Link>
        </div>
      </footer>
    </div>
  )
}
