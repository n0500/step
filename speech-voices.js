// Choose ordinary English speech voices, independently of device list order.
(() => {
  "use strict";

  const effects = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|hysterical|jester|organ|trinoids|whisper|wobble|zarvox|superstar|grandma|grandpa|junior|princess|ralph|fred)\b/i;
  const male = /\b(alex|aaron|daniel|evan|tom|oliver|arthur|nathan|david|mark|guy|ryan|andrew|brian|matthew|joey)\b/i;
  const ordinary = /\b(samantha|ava|allison|susan|victoria|zoe|karen|moira|tessa|serena|fiona|salli|joanna|emma|amy|aria|jenny|michelle|libby|sonia|hazel|zira)\b/i;
  const words = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const locale = voice => String(voice.lang || "").toLowerCase().replace(/_/g, "-");

  function pickEnglish(count = 1) {
    let available;
    try { available = window.speechSynthesis?.getVoices?.() || []; }
    catch (_) { return []; }
    const candidates = available.filter(voice =>
      /^en(?:-|$)/.test(locale(voice)) && !effects.test(words(voice.name + " " + (voice.voiceURI || "")))
    );
    const rank = voice => {
      const name = words(voice.name), language = locale(voice);
      const known = male.test(name) || ordinary.test(name) || /\bgoogle (us|uk|english)\b/.test(name);
      return (known ? 1000 : 0) + (language === "en-us" ? 100 : language === "en-gb" ? 80 : 0)
        + (male.test(name) ? 40 : 0) + (/\b(natural|enhanced|premium)\b/.test(name) ? 10 : 0)
        + (voice.default ? 5 : 0);
    };
    candidates.sort((a, b) => rank(b) - rank(a)
      || words(a.name).localeCompare(words(b.name))
      || locale(a).localeCompare(locale(b))
      || String(a.voiceURI || "").localeCompare(String(b.voiceURI || "")));
    const selected = [], identities = new Set();
    for (const voice of candidates) {
      const name = words(voice.name);
      const identity = name.match(male)?.[0] || name.match(ordinary)?.[0]
        || name.replace(/\b(enhanced|premium|compact|natural|default)\b/g, "").trim();
      if (identities.has(identity)) continue;
      identities.add(identity);
      selected.push(voice);
      if (selected.length >= count) break;
    }
    return selected;
  }

  // Read the current device list on every play; Safari can populate it late.
  window.STEPUP_SPEECH = { pickEnglish };
})();
