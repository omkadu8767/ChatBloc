import { Box, CheckCircle2, Database, Lock, Zap } from "lucide-react";

function HomePage({ onGetStarted }) {
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
            {/* Background gradients */}
            <div className="pointer-events-none fixed -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl" />

            {/* Header */}
            <header className="relative border-b border-white/10 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-cyan-400">ChatBloc</h1>
                            <p className="text-xs text-slate-400">End-to-End Encrypted Messaging with Blockchain Integrity</p>
                        </div>
                        <button
                            className="rounded-lg bg-cyan-400 px-6 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
                            type="button"
                            onClick={onGetStarted}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative border-b border-white/10">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-24">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl font-bold sm:text-5xl">
                            Secure Messaging with Cryptographic Integrity Verification
                        </h2>
                        <p className="mt-6 text-lg text-slate-300">
                            Send encrypted messages with AES-256 encryption, store message hashes on blockchain, and verify integrity using SHA-256. Perfect for learning secure communication architectures.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <button
                                className="rounded-lg bg-cyan-400 px-8 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                                type="button"
                                onClick={onGetStarted}
                            >
                                Start Chatting
                            </button>
                            <a
                                className="rounded-lg border border-cyan-400/50 px-8 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-400/10"
                                href="#tech-stack"
                            >
                                View Tech Stack
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative border-b border-white/10">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-24">
                    <h3 className="mb-12 text-3xl font-bold">How It Works</h3>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Send Flow */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                            <h4 className="mb-6 flex items-center gap-3 text-xl font-semibold text-cyan-400">
                                <Zap size={24} />
                                Sending a Message
                            </h4>
                            <ol className="space-y-4 text-slate-300">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-cyan-400/20 px-3 py-1 text-cyan-400">1</span>
                                    <span>User enters plaintext message</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-cyan-400/20 px-3 py-1 text-cyan-400">2</span>
                                    <span>Message is encrypted using AES-256-CBC with random IV</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-cyan-400/20 px-3 py-1 text-cyan-400">3</span>
                                    <span>SHA-256 hash of plaintext is computed</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-cyan-400/20 px-3 py-1 text-cyan-400">4</span>
                                    <span>Encrypted message saved to MongoDB</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-cyan-400/20 px-3 py-1 text-cyan-400">5</span>
                                    <span>Hash is submitted to smart contract on Sepolia blockchain</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-cyan-400/20 px-3 py-1 text-cyan-400">6</span>
                                    <span>Blockchain confirmaton updates in real-time via Socket.io</span>
                                </li>
                            </ol>
                        </div>

                        {/* Receive/Verify Flow */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                            <h4 className="mb-6 flex items-center gap-3 text-xl font-semibold text-emerald-400">
                                <CheckCircle2 size={24} />
                                Verifying a Message
                            </h4>
                            <ol className="space-y-4 text-slate-300">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-400">1</span>
                                    <span>Receiver fetches encrypted message from MongoDB</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-400">2</span>
                                    <span>Message is decrypted using AES private key from env</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-400">3</span>
                                    <span>SHA-256 hash is recomputed from decrypted plaintext</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-400">4</span>
                                    <span>Blockchain hash is fetched from smart contract</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-400">5</span>
                                    <span>Hashes are compared: match = Verified, mismatch = Tampered</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-400">6</span>
                                    <span>Status displayed with both encrypted and decrypted content</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="relative border-b border-white/10">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-24">
                    <h3 className="mb-12 text-3xl font-bold">Key Features</h3>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <Lock className="flex-shrink-0 text-cyan-400" size={24} />
                            <div>
                                <h4 className="font-semibold">AES-256 Encryption</h4>
                                <p className="mt-2 text-sm text-slate-400">Messages encrypted client-side before transmission using AES-256-CBC.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <Box className="flex-shrink-0 text-purple-400" size={24} />
                            <div>
                                <h4 className="font-semibold">Blockchain Verification</h4>
                                <p className="mt-2 text-sm text-slate-400">Message hashes stored immutably on Sepolia smart contract.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <CheckCircle2 className="flex-shrink-0 text-emerald-400" size={24} />
                            <div>
                                <h4 className="font-semibold">Integrity Verification</h4>
                                <p className="mt-2 text-sm text-slate-400">SHA-256 hashes compared to detect tampering or message modification.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <Database className="flex-shrink-0 text-blue-400" size={24} />
                            <div>
                                <h4 className="font-semibold">MongoDB Persistence</h4>
                                <p className="mt-2 text-sm text-slate-400">All encrypted messages stored securely with user and status tracking.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <Zap className="flex-shrink-0 text-yellow-400" size={24} />
                            <div>
                                <h4 className="font-semibold">Real-Time Updates</h4>
                                <p className="mt-2 text-sm text-slate-400">Socket.io enables instant message delivery and blockchain status updates.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <Lock className="flex-shrink-0 text-rose-400" size={24} />
                            <div>
                                <h4 className="font-semibold">JWT Authentication</h4>
                                <p className="mt-2 text-sm text-slate-400">Bcrypt password hashing and JWT tokens for secure session management.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="relative border-b border-white/10" id="tech-stack">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-24">
                    <h3 className="mb-12 text-3xl font-bold">Technology Stack</h3>

                    <div className="grid gap-8 lg:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h4 className="mb-4 font-semibold text-cyan-400">Frontend</h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>• React 18 (Vite)</li>
                                <li>• Tailwind CSS 3.4</li>
                                <li>• Axios API client</li>
                                <li>• Socket.io client</li>
                                <li>• Lucide icons</li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h4 className="mb-4 font-semibold text-blue-400">Backend</h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>• Express.js</li>
                                <li>• MongoDB + Mongoose</li>
                                <li>• JWT authentication</li>
                                <li>• Bcrypt password hashing</li>
                                <li>• Socket.io for real-time</li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h4 className="mb-4 font-semibold text-purple-400">Blockchain</h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>• Solidity 0.8.24</li>
                                <li>• Hardhat framework</li>
                                <li>• Ethers.js SDK</li>
                                <li>• Sepolia testnet</li>
                                <li>• Alchemy RPC</li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h4 className="mb-4 font-semibold text-emerald-400">Cryptography</h4>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li>• AES-256-CBC encryption</li>
                                <li>• SHA-256 hashing</li>
                                <li>• Node.js crypto module</li>
                                <li>• Random IV generation</li>
                                <li>• Secure key derivation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="relative border-b border-white/10">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:py-24">
                    <h3 className="mb-12 text-3xl font-bold">Security Measures</h3>

                    <div className="space-y-6">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h4 className="mb-3 font-semibold text-cyan-400">Message Encryption</h4>
                            <p className="text-slate-300">Every message is encrypted using AES-256-CBC with a unique random IV before storage or transmission. Only users with the encryption key can decrypt messages.</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h4 className="mb-3 font-semibold text-emerald-400">Blockchain Integrity</h4>
                            <p className="text-slate-300">Message hashes are stored immutably on the Ethereum Sepolia blockchain. This cryptographic proof of the original message content cannot be forged or modified without detection.</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h4 className="mb-3 font-semibold text-purple-400">Authentication</h4>
                            <p className="text-slate-300">User passwords are hashed with bcrypt (10 salt rounds). JWT tokens expire after 7 days. All API endpoints require valid authentication tokens.</p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h4 className="mb-3 font-semibold text-rose-400">Rate Limiting</h4>
                            <p className="text-slate-300">API requests are rate-limited (300 per 15 minutes) to prevent abuse. Helmet middleware adds security headers to all responses.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative">
                <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-8 lg:py-24">
                    <h3 className="mb-6 text-3xl font-bold">Ready to Secure Your Conversations?</h3>
                    <p className="mb-8 text-lg text-slate-300">Join the encrypted messaging network and verify message integrity with blockchain.</p>
                    <button
                        className="rounded-lg bg-cyan-400 px-8 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                        type="button"
                        onClick={onGetStarted}
                    >
                        Get Started Now
                    </button>
                </div>
            </section>

        </div>
    );
}

export default HomePage;
