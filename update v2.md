analisis secara keseluruhan dengan detail untuk mengetahui workflownya dan juga kritik dari tersebut

how much human testing has it had? if it's advising on financial information you'll excuse me if I don't trust it. as you vibe coded it I also used AI to verify my claims:

1. “AI financial shield” handling bank statements
This is the biggest red flag.
Even with claims like “zero retention”, you’re still looking at:
Extremely sensitive financial data (transactions, balances, identifiers)
Being processed by a third-party AI model (Gemini 2.0 Flash)
That introduces multiple risks:
Data exfiltration risk — even transient processing can leak via logs, telemetry, or misconfiguration
Regulatory exposure — in the UK/EU this would fall under GDPR + potentially PSD2/Open Banking rules
Trust boundary confusion — users may assume “AI = safe” without understanding where their data actually goes
“Processed in memory” sounds reassuring, but:
It’s not verifiable
It’s often marketing shorthand, not a guarantee
It says nothing about upstream APIs (e.g. Google’s handling)
2. Automated scam detection = false confidence problem
“Real-time Ponzi pattern detection” sounds good, but:
These systems are probabilistic, not authoritative
False negatives → scams slip through
False positives → legitimate things flagged as scams
The real danger is behavioural:
Users may outsource judgement to the system.
That’s worse than no tool at all if it creates overconfidence.
3. “Track debt traps” — edging into financial advice
This crosses into a heavily regulated space:
In the UK this would flirt with FCA-regulated financial advice
In Indonesia (their target), there are also financial authority rules (OJK)
If the system:
Recommends actions
Flags “bad” financial products
Suggests behavioural changes
…it may legally count as advisory, not just “analysis”.
That’s a compliance minefield.
4. “Vibe coding” + fintech = concerning combination
This line is subtle but telling:
“Rapidly shipped using agentic AI workflows”
That implies:
High velocity
Potentially low human verification depth
Rapid iteration over sensitive systems
That’s fine for a UI demo.
It is not fine for software handling financial data and trust decisions.
5. Stack choices vs responsibility
Nothing wrong with the stack technically (Next.js, Supabase, Redis, etc.), but:
Supabase → backend-as-a-service = more third-party surface area
Gemini → external AI dependency
Vercel → hosting layer
You now have a chain of trust across multiple vendors, any of which can:
Log data
Misconfigure access
Introduce vulnerabilities
6. The “justice” framing
This bit is more psychological than technical:
“Code is a shield. Technology is a tool for justice.”
That framing can be risky because it:
Positions the system as morally authoritative
Encourages users to trust it beyond its actual capabilities
That’s how people get hurt — not through malice, but misplaced trust.
7. What would make this not dangerous
To be fair, this kind of tool could be done responsibly, but it would need:
Fully on-device processing (no external AI APIs)
Clear non-advisory disclaimers
Transparent data flow diagrams
Independent security audits
Regulatory alignment (financial + data protection)


serta update v2 ini lebih big update dengan banyak sekali menutupi kekurangan serta mementingkan stabilitas serta keamanan tinggi dan sistem blockchain dan juga terenkripsi data dan juga keamanan tinggi