// ----------------------------
// SITE NOTES
// ----------------------------
// The text inside the small pop-up notes. The AI Usage and Privacy Policy notes open
// from the footer on every page. Each hero note opens from the question mark on that
// page's hero photo, and a page's question mark only appears once its note has text.
//
// Notes are written in HTML, between the backticks.
//   Paragraphs      <p>Your text.</p>
//   Links           <a href="the full web address">the linked words</a>
//   Bold            <strong>bold words</strong>
//   Alignment       add class="note-center" or class="note-justify" to a paragraph,
//                   which is left aligned otherwise
// Backticks themselves can't appear inside a note, but quotes and apostrophes can.

window.SITE_NOTES = {

  aiUsage: `
    <p class="note-justify">
      Maintenance of my website is assisted by
      <a href="https://claude.com/product/claude-code">Claude Code</a>,
      an AI coding assistant by Anthropic.
    </p>
  `,

  privacy: `
    <p class="note-center"><strong>Updated September 27, 2026</strong></p>
    <p class="note-justify">
      My website uses Fathom Analytics to understand visitor rates and trends. Fathom’s
      visitor analytics does not use tracking cookies or build advertising profiles across
      websites. It briefly processes request information, including IP address and
      user-agent, to create site-specific visitor signatures and produce website
      statistics. You can read more about how Fathom handles this information in its
      <a href="https://usefathom.com/legal/dpa">data processing agreement</a> and
      <a href="https://usefathom.com/data">data journey</a>.
    </p>
  `,

  // One note per hero photo. Leave a note empty to keep that page's question mark hidden.
  hero: {
    index: ``,
    research:`
    <p class="note-justify">
      Image depicting Library of Congress was obtained from
      <a href="https://en.wikipedia.org/wiki/File:LOC_Main_Reading_Room_Highsmith.jpg">Wikipedia</a>.
    </p>
      `,
    photography: ``,
  },

};
