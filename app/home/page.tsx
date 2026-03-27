'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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
      interested_in: 'Checkmate IPL Fantasy Auction',
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
      q: 'What is Checkmate?',
      a: 'Checkmate is a live fantasy cricket auction platform where you bid on IPL players using a fixed purse of points. Build the best squad, outsmart your opponents, and win the league!'
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
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-400 rotate-45 rounded-sm" />
          <span className="font-bold tracking-widest uppercase text-sm">Checkmate</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#how-it-works" className="text-zinc-500 hover:text-white text-sm transition-colors hidden md:block">How it works</a>
          <a href="#faq" className="text-zinc-500 hover:text-white text-sm transition-colors hidden md:block">FAQ</a>
          <a href="#register" className="text-zinc-500 hover:text-white text-sm transition-colors hidden md:block">Register Interest</a>
          <Link href="/login" className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            Sign In →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-24 md:py-36 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-400 text-xs font-medium tracking-wider uppercase">IPL 2026 Season Live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none tracking-tight">
          The Ultimate
          <br />
          <span className="text-amber-400">Fantasy Cricket</span>
          <br />
          Auction
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Bid smart. Build the perfect squad. Outsmart every manager in the room.
          Checkmate is where cricket passion meets strategic thinking.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#register"
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            Register Your Interest →
          </a>
          <a href="#how-it-works"
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
            How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-20 max-w-2xl mx-auto">
          {[
            { value: '249', label: 'IPL Players' },
            { value: '1000', label: 'Points Purse' },
            { value: '30s', label: 'Bid Timer' },
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
          <p className="text-zinc-500">Three steps to fantasy cricket glory</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Join the Auction',
              description: 'Get your 1000-point purse and compete in a live auction room with other managers. Bid on IPL players across Platinum, Gold, Silver and Bronze tiers.',
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
              description: 'Score points as your players perform in real IPL matches. Top the leaderboard at the end of the season to claim the championship.',
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
            <h2 className="text-3xl md:text-4xl font-black mb-3">Why Checkmate?</h2>
            <p className="text-zinc-500">Built for serious fantasy cricket managers</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '⚡', title: 'Real-time Live Auction', desc: 'Bid simultaneously with all managers in a live auction room. 30-second timer per player keeps the energy high.' },
              { icon: '🧠', title: 'Pure Strategy', desc: 'Manage your purse across 249 players. Reserve enough for mandatory squad slots. Outsmart your opponents with smart bidding.' },
              { icon: '🎯', title: 'Power Players', desc: 'Nominate key players for 2x points multiplier. One smart Power Player pick can change your entire season.' },
              { icon: '📊', title: 'Live Leaderboard', desc: 'Track your ranking after every IPL match. Points update in real-time based on actual player performances.' },
              { icon: '🔄', title: 'Dynamic Rules', desc: 'Each auction group can customise rules — player classes, purse size, squad limits. Fully flexible for any group size.' },
              { icon: '🏏', title: 'Full IPL Coverage', desc: 'All 249 IPL 2026 players across 10 teams. Platinum, Gold, Silver and Bronze tiers with different base prices.' },
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
          <p className="text-zinc-500">Join the next auction. We'll be in touch with details.</p>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-green-400 font-bold text-xl mb-2">You're on the list!</p>
            <p className="text-zinc-500 text-sm">We'll reach out with auction details soon. Get ready to bid!</p>
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
              No spam. We'll only contact you about auction opportunities.
            </p>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="relative border-t border-zinc-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-amber-400 rotate-45 rounded-sm" />
            <span className="font-bold tracking-widest uppercase text-sm">Checkmate</span>
          </div>
          <p className="text-zinc-600 text-sm">
            Powered by{' '}
            <a href="https://nbbluestudios.com" target="_blank" className="hover:text-zinc-400 transition-colors">
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
